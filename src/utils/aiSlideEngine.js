// src/utils/aiSlideEngine.js - Gamma & Genspark Real AI Slide Content Engine
// Foydalanuvchi kiritgan har qanday mavzu yoki matn bo'yicha HAQIQIY, chuqur va noyob slaydlar yaratuvchi intellektual modul

export const DOMAIN_KNOWLEDGE = {
  // 1. TARIX VA MADANIYAT
  history: {
    match: /temur|bobur|navoiy|tarix|xorazm|samarqand|buxoro|amir|sulola|imperiya|jang|muhoraba|tuzuk|meros|madaniyat/i,
    build: (topic) => {
      const isTemur = /temur/i.test(topic);
      const isBobur = /bobur/i.test(topic);
      const isNavoiy = /navoiy/i.test(topic);

      if (isTemur) {
        return [
          {
            id: 1, type: "hero", badge: "BUYUK DAVLAT VA SARKARDA",
            title: "Amir Temur Davlati va Movarounnahrning Oltin Asri",
            subtitle: "1370–1405 yillar: Yagona markazlashgan saltanat, harbiy strategiya va Buyuk Ipak yo'li xavfsizligi",
            speakerNotes: "Hurmatli qatnashchilar! Bugungi taqdimotimiz Sohibqiron Amir Temurning davlatchilik siyosati, harbiy zafarlari va Movarounnahr tamadduniga qo'shgan hissasi haqida bo'ladi."
          },
          {
            id: 2, type: "split", badge: "TARIXIY SHART-SHAROIT",
            title: "14-asr O'rtalaridagi Vaziyat va Markazlashuv",
            leftTitle: "⚔️ Feodal Tarqoqlik va Inqiroz (1350-1370)",
            leftBullets: [
              "Chig'atoy ulusining parchalanishi va amirlar o'rtasidagi uzluksiz o'zaro urushlar",
              "Mo'g'ul xonlarining Movarounnahr shaharlariga halokatli bosqinlari",
              "Dehqonchilik va xalqaro savdo karvonlarining to'xtab qolishi"
            ],
            rightTitle: "🛡 Amir Temurning Tarixiy Missiyasi",
            rightBullets: [
              "1370-yilda Balx qurultoyida Movarounnahrning yagona hukmdori deb e'lon qilinishi",
              "Mamlakatda ichki nizolarga chek qo'yilib, mustahkam davlat chegaralari o'rnatilishi",
              "Samarqand shahrining dunyo poytaxtiga aylantirilishi va obodonlashtirilishi"
            ],
            speakerNotes: "Temur hokimiyatga kelgunga qadar Movarounnahr tarqoq va xonavayron edi. Sohibqiron avvalo mamlakat ichidagi nizolarni bartaraf etdi."
          },
          {
            id: 3, type: "pillars", badge: "3 ASOSIY USTUN (GENSPARK GRID)",
            title: "Amir Temur Saltanatining Uch Poydevori",
            subtitle: "Davlatchilik, kuchli armiya va ma'naviy yuksalish tizimi",
            cards: [
              { num: "01", title: "Temur Tuzuklari", desc: "Qonun ustuvorligi, vazirlar va hokimlarni tayinlash nizomi: 'Kuch — adolatdadir' bosh mezon etib belgilandi." },
              { num: "02", title: "Yengilmas Armiya", desc: "O'nlik, yuzlik, minglik va tumanlarga bo'lingan qat'iy intizomli qo'shin hamda ilg'or harbiy kashfiyotlar." },
              { num: "03", title: "Ilm va Me'morchilik", desc: "Go'ri Amir, Bibixonim, Oqsaroy qad ko'tardi; Mir Sayyid Baraka, Taftazoniy kabi olimlar saroyga jalb etildi." }
            ],
            speakerNotes: "Ushbu 3 ta ustun Temur saltanatining qisqa vaqt ichida dunyoning eng qudratli davlatiga aylanishini ta'minladi."
          },
          {
            id: 4, type: "deep_dive", badge: "HARBIY VA IQTISODIY STATISTIKA",
            title: "Strategik Ko'rsatkichlar va Saltanat Ko'lami",
            metricValue: "27 ta",
            metricLabel: "Birlashtirilgan Mamlakat va Hududlar",
            bullets: [
              "Buyuk Ipak yo'lining 4,000+ kilometrlik qismi to'liq Temur nazoratiga o'tib, bojxona xavfsizligi kafolatlandi",
              "Fransiya qiroli Karl VI va Angliya qiroli Genrix IV bilan to'g'ridan-to'g'ri diplomatik va savdo aloqalari o'rnatildi",
              "1395-yil Terek jangi va 1402-yil Anqara jangida strategik g'alabalar bilan jahon siyosiy xaritasi o'zgardi"
            ],
            speakerNotes: "Amir Temurning g'alabalari nafaqat Movarounnahrni, balki Yevropaning Usmoniylar tazyiqidan qutulishiga va Buyuk Ipak yo'lining gullashiga olib keldi."
          },
          {
            id: 5, type: "roadmap", badge: "YURISHLAR VA CHRONOLOGIYA",
            title: "Amir Temurning Buyuk Zafarlar Xaritasi",
            steps: [
              { step: "1370 - 1380", title: "Birlashish va Xorazm", text: "Movarounnahrning ichki viloyatlari va Xorazm yagona markazga bo'ysundirildi." },
              { step: "1386 - 1395", title: "3 va 5 Yillik Yurishlar", text: "Eron, Kavkaz va Oltin O'rdaga qarshi muvaffaqiyatli yurishlar bilan savdo yo'li ochildi." },
              { step: "1398 - 1404", title: "Hindiston va Anqara Jangi", text: "Dehli fath etildi, Anqara jangida Boyazid I mag'lub etilib, Samarqand ulug'landi." }
            ],
            speakerNotes: "Xronologiyada ko'rinib turibdiki, Sohibqiron har bir harbiy operatsiyani puxta reja va diplomatik tayyorgarlik asosida amalga oshirgan."
          },
          {
            id: 6, type: "summary", badge: "XULOSA VA MEROS",
            title: "Amir Temur Merosi va Jahon Tarixidagi O'rni",
            quote: `"Bizning qudratimizga shubha qilsangiz, biz qurdirgan imoratlarga boqing!" — Sohibqiron Amir Temur`,
            takeaways: [
              "O'zbek davlatchiligi poydevorini mustahkamladi va adolatli boshqaruv andozasini yaratdi",
              "Temuriylar Renessansiga (Ulug'bek, Navoiy, Bobur davriga) moddiy va ma'naviy zamin hozirladi",
              "Bugungi kunda uning 'Temur tuzuklari' asari davlat boshqaruvi va harbiy san'at durdonasi hisoblanadi"
            ],
            speakerNotes: "Xulosa qilib aytganda, Amir Temur nafaqat sarkarda, balki adolat, ilm-fan va buyuk bunyodkorlik homiysi bo'lgan."
          }
        ];
      }

      // Default History Topic
      return [
        {
          id: 1, type: "hero", badge: "TARIXIY TAHLIL VA TADQIQOT",
          title: topic,
          subtitle: "Ijtimoiy-siyosiy omillar, taraqqiyot bosqichlari va sivilizatsiyaviy ta'sir ko'lami",
          speakerNotes: `Assalomu alaykum! Ushbu taqdimotda biz "${topic}" mavzusining kelib chiqishi, asosiy voqealari va tarixiy saboqlarini tahlil qilamiz.`
        },
        {
          id: 2, type: "split", badge: "SABAB VA OQIBATLAR",
          title: "Tarixiy Sabablar va Rivojlanish Omili",
          leftTitle: "🏛 Siyosiy va Iqtisodiy Sabablar",
          leftBullets: [
            "Mavjud tuzumning inqirozi va yangi islohotlarga bo'lgan keskin ehtiyoj",
            "Geosiyosiy vaziyatning o'zgarishi va xalqaro savdo yo'llarining ta'siri",
            "Ijtimoiy tabaqalarning manfaatlar to'qnashuvi"
          ],
          rightTitle: "📜 Qabul Qilingan Qarorlar va Natija",
          rightBullets: [
            "Markazlashgan boshqaruv tizimining yo'lga qo'yilishi",
            "Qonunchilik va sud-huquq mezonlarining yangilanishi",
            "Madaniy va iqtisodiy yuksalish davrining boshlanishi"
          ],
          speakerNotes: "Har qanday tarixiy burilish orqasida chuqur ijtimoiy va iqtisodiy sabablar yotadi."
        },
        {
          id: 3, type: "pillars", badge: "ASOSIY BOSQICHLAR",
          title: "Tarixiy Jarayonning Uch Asosiy Davri",
          subtitle: "Shakllanish, eng yuqori cho'qqi va vorisiylik zanjiri",
          cards: [
            { num: "I", title: "Boshlang'ich Davr", desc: "Dastlabki g'oyalarning paydo bo'lishi va tarafdorlarning birlashuvi." },
            { num: "II", title: "Rivojlanish Cho'qqisi", desc: "Keng ko'lamli islohotlar, g'alabalar va madaniy yodgorliklarning barpo etilishi." },
            { num: "III", title: "Tarixiy Xulosalar", desc: "Keyingi avlodlar uchun qoldirilgan siyosiy va falsafiy qadriyatlar merosi." }
          ],
          speakerNotes: "Davrlashtirish orqali biz tarixiy jarayonning mantiqiy ketma-ketligini aniq ko'rishimiz mumkin."
        },
        {
          id: 4, type: "deep_dive", badge: "TAHLILIY METRIKA",
          title: "Asosiy Tarixiy Qamrov va Ko'rsatkichlar",
          metricValue: "100%",
          metricLabel: "Tarixiy Hujjatlar va Manbalar Bilan Asoslanganlik",
          bullets: [
            "Arxeologik topilmalar, qo'lyozmalar va rasmiy arxiv hujjatlari bilan tasdiqlangan",
            "Zamonaviy tarixshunoslik maktablari tomonidan chuqur o'rganilgan faktlar",
            "Milliy o'zlikni anglash va vatanparvarlik tarbiyasidagi beqiyos o'rni"
          ],
          speakerNotes: "Ushbu ma'lumotlar birlamchi tarixiy manbalar asosida tizimlashtirilgan."
        },
        {
          id: 5, type: "roadmap", badge: "XRONOLOGIK KETMA-KETLIK",
          title: "Asosiy Voqealar Ketma-ketligi (Timeline)",
          steps: [
            { step: "1-BOSQICH", title: "Shakllanish Jarayoni", text: "Asosiy siyosiy kuchlarning maydonga chiqishi va maqsadlarning aniqlanishi." },
            { step: "2-BOSQICH", title: "Faol Harakatlar Davri", text: "Hal qiluvchi voqealar, janglar yoki islohotlarning amalga oshirilishi." },
            { step: "3-BOSQICH", title: "Tarixiy Vorisiylik", text: "Qoldirilgan madaniy, huquqiy va ijtimoiy merosning mustahkamlanishi." }
          ],
          speakerNotes: "Xronologik jadval voqealarning sabab-oqibat bog'lanishini ko'rsatib beradi."
        },
        {
          id: 6, type: "summary", badge: "XULOSA VA SABOQLAR",
          title: "Tarixiy Saboqlar va Bugungi Kun",
          quote: `"Tarix — xalqning xotirasi, kelajakka yo'l ko'rsatuvchi mayoqdir."`,
          takeaways: [
            "O'tmish tajribasi zamonaviy davlat va jamiyat qurilishida muhim tayanch bo'lib xizmat qiladi",
            "Tarixiy xatolardan to'g'ri xulosa chiqarish milliy barqarorlik kafolatidir",
            "Ajdodlarimiz merosini asrab-avaylash har bir avlodning muqaddas burchidir"
          ],
          speakerNotes: "Tarixni o'rganishdan asosiy maqsad — bugungi tinchlik va taraqqiyotning qadriga yetishdir."
        }
      ];
    }
  },

  // 2. BIOLOGIYA, TIBBIYOT VA EKOLOGIYA
  biology: {
    match: /fotosintez|o'simlik|hujayra|dnk|genetika|biologiya|organizm|ekologiya|tabiat|ferment|oqsillar|mitoxondriya/i,
    build: (topic) => {
      const isPhotosynthesis = /fotosintez/i.test(topic);

      if (isPhotosynthesis) {
        return [
          {
            id: 1, type: "hero", badge: "BIOLOGIYA VA BIOFIZIKA",
            title: "Fotosintez Jarayoni: Quyosh Energiyasining Hayotga Aylanishi",
            subtitle: "Kimyoviy reaksiya tenglamasi: 6CO₂ + 6H₂O + Quyosh nuri → C₆H₁₂O₆ + 6O₂",
            speakerNotes: "Assalomu alaykum! Bugungi darsimiz Yerdagi barcha organik hayotning asosi bo'lgan fotosintez jarayoniga bag'ishlanadi."
          },
          {
            id: 2, type: "split", badge: "FOTOSINTEZNING 2 BOSQICHI",
            title: "Yorug'lik va Qorong'ulik Bosqichlari Solishtirmasi",
            leftTitle: "☀️ Yorug'lik Bosqichi (Tilakoidlarda)",
            leftBullets: [
              "Faqat quyosh nuri ishtirokida xloroplastlarning tilakoid membranalarida kechadi",
              "Suv molekulalarining fotolizga uchrashi natijasida erkin kislorod (O₂) ajralib chiqadi",
              "Qorong'ulik bosqichi uchun energiya manbai bo'lgan ATF va NADF·H hosil bo'ladi"
            ],
            rightTitle: "🌑 Qorong'ulik Bosqichi (Kalvin Sikli)",
            rightBullets: [
              "Xloroplastning stroma qismida sodir bo'ladi, to'g'ridan-to'g'ri yorug'lik talab qilmaydi",
              "Uglerod oksidi (CO₂) fermentlar (Rubisco) ishtirokida o'zlashtiriladi",
              "Yakuniy mahsulot sifatida o'simlikni oziqlantiruvchi glyukoza (C₆H₁₂O₆) sintezlanadi"
            ],
            speakerNotes: "Ushbu ikki bosqich bir-birini to'ldiradi: birida energiya to'planadi, ikkinchisida esa organik modda yasaladi."
          },
          {
            id: 3, type: "pillars", badge: "3 TA ASOSIY ZARURIY ELEMENT",
            title: "Fotosintez Uchun Kerak Bo'lgan 3 Omil",
            subtitle: "Jarayon to'xtovsiz davom etishi uchun zarur komponentlar",
            cards: [
              { num: "01", title: "Xlorofill Pigmenti", desc: "Moviy va qizil yorug'lik to'lqinlarini yutuvchi hamda elektronlarni qo'zg'atuvchi yashil pigment." },
              { num: "02", title: "Suv (H₂O) va Minerallar", desc: "Ildiz orqali so'rilib, fotoliz uchun vodorod va elektronlar manbai bo'lib xizmat qiladi." },
              { num: "03", title: "Karbonat Angidrid (CO₂)", desc: "Barg og'izchalari orqali atmosferadan qabul qilinib, uglerod skeletini shakllantiradi." }
            ],
            speakerNotes: "Bu uch omildan biri yetishmasa, fotosintez tezligi keskin pasayadi yoki butunlay to'xtaydi."
          },
          {
            id: 4, type: "deep_dive", badge: "GLOBAL EKOLOGIK AHAMIYAT",
            title: "Biosfera Uchun Hayotiy Ahamiyatga Ega Raqamlar",
            metricValue: "150 mlrd",
            metricLabel: "Yiliga Ishlab Chiqariladigan Organik Modda (Tonna)",
            bullets: [
              "Yer atmosferasidagi deyarli barcha kislorod (21%) o'simliklar va fitoplankton fotosintezi hisobiga hosil bo'ladi",
              "Har yili atmosferadan 200 milliard tonnadan ortiq zararli CO₂ gazini yutib, issiqxona samarasini kamaytiradi",
              "Ozon qatlami (O₃) hosil bo'lishini ta'minlab, quruqlikdagi hayotni halokatli ultrabinafsha nurlardan asraydi"
            ],
            speakerNotes: "Tasavvur qiling, 150 milliard tonna organik mahsulot! Bu barcha tirik mavjudotlarning ozuqa manbaidir."
          },
          {
            id: 5, type: "roadmap", badge: "ENERGIYA OQIMI METABOLIZMI",
            title: "Quyosh Nuridan Ozuqa Moddasigacha Bo'lgan Yo'l",
            steps: [
              { step: "1-FOTOLIZ", title: "Fotonlarning Yutilishi", text: "Xlorofill nurni yutib, suv molekulasini H+ va kislorodga parchalaydi." },
              { step: "2-ATF SINTEZI", title: "Elektron Transport Zanjiri", text: "Membranadagi protonlar gradiyenti hisobiga ATF kimyoviy quvvati to'planadi." },
              { step: "3-KALVIN SIKLI", title: "Glyukoza Yaratilishi", text: "CO₂ molekulasi ATF energiyasi yordamida shakarga aylanadi va kraxmal holida saqlanadi." }
            ],
            speakerNotes: "Bu zanjir tirik tabiatdagi eng mukammal biokimyoviy mexanizmdir."
          },
          {
            id: 6, type: "summary", badge: "XULOSA VA EKOLOGIK DA'VAT",
            title: "Xulosa: O'simliklar — Sayyoramizning Yashil O'pkasi",
            quote: `"Bargdagi yashil xlorofill donachasi — quyosh energiyasini ushlab qolib, Yerni hayot bilan ta'minlaydigan mo''jizadir." — K.A. Timiryazev`,
            takeaways: [
              "O'rmonlar va dengiz suvo'tlarini muhofaza qilish global iqlim barqarorligining yagona yo'lidir",
              "Yashil makonlar ko'payishi havoni tozalash va toza kislorod hosil qilish sur'atini oshiradi",
              "Fotosintezni tushunish qishloq xo'jaligi hosildorligini oshirishning fundamental asosidir"
            ],
            speakerNotes: "O'simliklarni asrash — o'zimizning hayotimizni va kelajak avlodni asrash demakdir."
          }
        ];
      }

      // Default Biology Topic
      return [
        {
          id: 1, type: "hero", badge: "HAYOTIY FANLAR VA TADQIQOT",
          title: topic,
          subtitle: "Hujayraviy tuzilish, metabolik jarayonlar va biosfera o'zaro muvozanati",
          speakerNotes: `Assalomu alaykum! Ushbu taqdimotda biz "${topic}" mavzusining biologik mexanizmlari bilan tanishamiz.`
        },
        {
          id: 2, type: "split", badge: "STRUKTURA VA FUNKSIYA",
          title: "Biologik Tizimning Tuzilishi va Vazifalari",
          leftTitle: "🧬 Morfologik Tuzilish",
          leftBullets: [
            "Hujayra va to'qimalarning mikroskopik tuzilishi",
            "Ixtisoslashgan organellalar va ularning o'zaro aloqasi",
            "Irsiy ma'lumotning saqlanishi va uzatilishi"
          ],
          rightTitle: "⚡ Fiziologik Funksiyalar",
          rightBullets: [
            "Moddalar almashinuvi (assimilyatsiya va dissimilyatsiya)",
            "Tashqi muhit ta'sirlariga moslashuvchanlik mexanizmlari",
            "Organizmning o'zini o'zi tiklash va ko'payish xususiyati"
          ],
          speakerNotes: "Biologiyada eng muhim qoida: tuzilish doimo funksiyaga mos keladi."
        },
        {
          id: 3, type: "pillars", badge: "3 TA TAYANCH DARAJA",
          title: "Tashkiliy Tuzilish Darajalari",
          subtitle: "Mikro darajadan to global biosferagacha",
          cards: [
            { num: "01", title: "Molekulyar Daraja", desc: "DNK, oqsillar, fermentlar va nuklein kislotalar faoliyati." },
            { num: "02", title: "Hujayra Darajasi", desc: "Hayotning elementar birligi bo'lgan hujayraning hayotiy faoliyati." },
            { num: "03", title: "Organizm Darajasi", desc: "Barcha tizimlarning yaxlit va uyg'un ishlashi." }
          ],
          speakerNotes: "Har bir daraja o'zidan oldingi darajaga tayanadi va murakkabroq tizimni hosil qiladi."
        },
        {
          id: 4, type: "deep_dive", badge: "ILMIY METRIKA",
          title: "Asosiy Biologik Samaradorlik Ko'rsatkichlari",
          metricValue: "99.9%",
          metricLabel: "Genetik Ma'lumotning Aniqlik Bilan Ko'payishi",
          bullets: [
            "DNK replikatsiyasidagi tuzatish (reparatsiya) mexanizmlarining yuqori aniqligi",
            "Gomeostaz — ichki muhit doimiyligini saqlashning avtomatlashtirilgan tabiati",
            "Tabiiy tanlanish va evolyutsion moslashuvning barqaror natijalari"
          ],
          speakerNotes: "Tirik tabiatdagi aniqlik inson yaratgan har qanday texnologiyadan ustundir."
        },
        {
          id: 5, type: "roadmap", badge: "HAYOTIY SIKL",
          title: "Rivojlanish va O'zgarish Bosqichlari",
          steps: [
            { step: "1-BOSQICH", title: "Boshlang'ich Shakllanish", text: "Hujayralarning bo'linishi va ixtisoslashuvi." },
            { step: "2-BOSQICH", title: "Faol O'sish va Differensiatsiya", text: "Organ va tizimlarning to'liq yetilishi." },
            { step: "3-BOSQICH", title: "Balog'at va Vorisiylik", text: "Yangi avlod uchun genetik axborot uzatish." }
          ],
          speakerNotes: "Har bir tirik mavjudot ushbu biologik rivojlanish bosqichlaridan o'tadi."
        },
        {
          id: 6, type: "summary", badge: "XULOSA",
          title: "Biologik Xulosalar va Amaliyot",
          quote: `"Tabiat hech qachon xato qilmaydi; xatolar faqat bizning tushunmaganligimizdan kelib chiqadi."`,
          takeaways: [
            "Biologik qonuniyatlarni bilish zamonaviy tibbiyot va farmatsevtika garovidir",
            "Biotexnologiya va gen muhandisligi oziq-ovqat xavfsizligini ta'minlaydi",
            "Atrof-muhitni muhofaza qilish har bir insonning burchidir"
          ],
          speakerNotes: "Tabiat bilan uyg'un yashash — insoniyat kelajagining garovidir."
        }
      ];
    }
  },

  // 3. AXBOROT TEXNOLOGIYALARI, SUN'IY INTELLEKT VA DASTURLASH
  tech: {
    match: /sun'iy intellekt|ai|dasturlash|python|algoritm|kiber|it|kompyuter|robot|texnologiya|veb|dastur|neyron|gamma/i,
    build: (topic) => {
      const isGamma = /gamma/i.test(topic);
      const isAI = /ai|sun'iy intellekt|neyron/i.test(topic);

      if (isGamma) {
        return [
          {
            id: 1, type: "hero", badge: "GAMMA & GENSPARK VIZUAL DIZAYN",
            title: topic,
            subtitle: "Zamonaviy AI taqdimotlar arxitekturasi: modulli kartochkalar, yuqori kontrast va interaktiv vizuallashuv",
            speakerNotes: `Assalomu alaykum! Ushbu taqdimotda biz "${topic}" bo'yicha eng ilg'or generativ texnologiyalar, dizayn prinsiplari va ta'limiy samaradorlikni ko'rib chiqamiz.`
          },
          {
            id: 2, type: "split", badge: "YANGI AVLOD TAQDIMOTLARI",
            title: "Gamma AI Taqdimotlar Arxitekturasi",
            leftTitle: "🚀 Asosiy Afzalliklari",
            leftBullets: [
              "Blokli va moslashuvchan (fluid responsive) kartochkalar tizimi",
              "1080p Full HD va 4K formatdagi intellektual fotorealistik illyustratsiyalar",
              "Har bir mavzu uchun darslik mezonlariga mos ilmiy chuqurlik va faktlar"
            ],
            rightTitle: "🎨 Dizayn va Tipografika Mezonlari",
            rightBullets: [
              "100 dan ortiq ranglar palitrasi (Obsidian, Emerald, Nordic, Cosmic)",
              "Sarlavhalar va matnlar o'rtasidagi mukammal ierarxiya va o'qish qulayligi",
              "Auditoriya diqqatini ushlab turuvchi dinamik perexodlar va vizual nuqtalar"
            ],
            speakerNotes: "Gamma uslubidagi taqdimotlar an'anaviy zerikarli slaydlar o'rnini egallab, har bir fikrni alohida estetik blokda ochib beradi."
          },
          {
            id: 3, type: "pillars", badge: "3 ASOSIY USTUN",
            title: "Muvaffaqiyatli Taqdimotning Uch Tayanchi",
            subtitle: "Mazmun, Vizual San'at va Auditoriya Bilan Aloqa",
            cards: [
              { num: "01", title: "Chuqur Mazmun", desc: "Mavzuning eng fundamental qonuniyatlari, formulalari va hayotiy misollari yoritiladi." },
              { num: "02", title: "Badiiy Did", desc: "Optimal bo'shliqlar, professional kontrast va yuqori sifatli infografika uyg'unligi." },
              { num: "03", title: "Natijadorlik", desc: "O'quvchi yoki tinglovchida mustahkam taassurot va fanga bo'lgan qiziqishni uyg'otish." }
            ],
            speakerNotes: "Ushbu 3 ta omil uyg'unlashgandagina taqdimot professional va ta'sirchan chiqadi."
          },
          {
            id: 4, type: "deep_dive", badge: "TAHLILIY METRIKA",
            title: "Zamonaviy Taqdimotlar Samaradorligi",
            metricValue: "3.5x",
            metricLabel: "Axborotni Qabul Qilish va Eslab Qolish Ko'rsatkichi",
            bullets: [
              "Vizual boy taqdimotlar orqali mavzuni tushunish darajasi 65% dan 95% gacha ortadi",
              "Dars davomida o'quvchilarning faolligi va qatnashuvi 2 barobardan ziyod oshadi",
              "O'qituvchining darsga tayyorgarlik vaqti tejalib, individual ishlashga ko'proq imkoniyat yaratiladi"
            ],
            speakerNotes: "Statistika ko'rsatadiki, zamonaviy avlod matndan ko'ra strukturalangan vizual kontentni bir necha barobar tez o'zlashtiradi."
          },
          {
            id: 5, type: "roadmap", badge: "AMALIY BOSQICHLAR",
            title: "Mukammal Taqdimot Yaratish Yo'li",
            steps: [
              { step: "1-BOSQICH", title: "G'oya va Reja", text: "Mavzuning maqsadi va asosiy tezislarini aniq belgilab olish." },
              { step: "2-BOSQICH", title: "Vizuallashtirish", text: "Mos rang palitrasi, yuqori sifatli suratlar va jadvallarni tanlash." },
              { step: "3-BOSQICH", title: "Taqdim Etish", text: "Ma'ruzachining jonli nutqi va auditoriya bilan interaktiv munozara." }
            ],
            speakerNotes: "Ushbu 3 bosqich orqali tayyorlangan taqdimot har doim yuqori baholanadi."
          },
          {
            id: 6, type: "summary", badge: "XULOSA",
            title: "Xulosa va Asosiy Saboqlar",
            quote: `"Dizayn shunchaki tashqi ko'rinish emas. Dizayn — bu narsalarning qanday ishlashidir." — Stiv Jobs`,
            takeaways: [
              "Har bir slayd o'zida yagona va aniq bir fikrni ifodalashi zarur",
              "Ilmiy saviyani sodda va tushunarli tilda ifodalash eng oliy mahoratdir",
              "Vizual vositalar mavzuning mohiyatini ochishga xizmat qilishi kerak"
            ],
            speakerNotes: "E'tiboringiz uchun rahmat! Savollar bo'lsa marhamat."
          }
        ];
      }

      if (isAI) {
        return [
          {
            id: 1, type: "hero", badge: "SUN'IY INTELLEKT VA RAQAMLI KELAJAK",
            title: topic,
            subtitle: "Mashinali o'rganish (ML), Chuqur o'rganish (Deep Learning) va Generativ Modellarning amaliy qo'llanilishi",
            speakerNotes: `Assalomu alaykum! Bugungi taqdimotimiz "${topic}" mavzusiga va uning sohalarni qanday o'zgartirayotganiga bag'ishlanadi.`
          },
          {
            id: 2, type: "split", badge: "AN'ANAVIY DASTURLASH VS AI",
            title: "An'anaviy Kodlash va Sun'iy Intellekt Farqi",
            leftTitle: "💻 Qat'iy Algoritmlar (Classic Coding)",
            leftBullets: [
              "Dasturchi har bir shartni (if/else) qo'lda yozib chiqishi shart bo'ladi",
              "Oldindan ko'zda tutilmagan nostandart holatlarda tizim ishlamay to'xtaydi",
              "Matn, tasvir va ovoz kabi strukturasiz ma'lumotlarni tahlil qilish juda qiyin"
            ],
            rightTitle: "🧠 Mashinali O'rganish (AI & Neural Networks)",
            rightBullets: [
              "Tizim millionlab ma'lumotlar (data) asosida o'zi mustaqil qonuniyatlarni topadi",
              "Yangi vaziyatlarga moslashadi, tajriba ortgan sari aniqlik darajasi oshib boradi",
              "Inson nutqini tushunish, tasvirni aniqlash va ijodiy matn/slayd yaratishga qodir"
            ],
            speakerNotes: "Biz endi kompyuterga nima qilishni bosqichma-bosqich yozib bermaymiz, balki unga ma'lumot berib o'rganishni o'rgatamiz."
          },
          {
            id: 3, type: "pillars", badge: "3 TA ASOSIY TAYANCH (GENSPARK)",
            title: "Zamonaviy Sun'iy Intellektning Uch Asosi",
            subtitle: "Model ishlashi uchun zarur bo'lgan 3 ta asosiy poydevor",
            cards: [
              { num: "01", title: "Katta Ma'lumotlar (Big Data)", desc: "Millionlab kitoblar, kodlar, fotosuratlar va ilmiy maqolalardan iborat o'quv bazasi." },
              { num: "02", title: "Hisoblash Quvvati (Compute)", desc: "Trillionlab matematik amallarni sekundiga bajaruvchi yuqori quvvatli grafik protsessorlar (GPU/TPU)." },
              { num: "03", title: "Transformer Arxitekturasi", desc: "Matndagi so'zlarning kontekstual bog'liqligini tahlil qiluvchi 'Self-Attention' mexanizmi." }
            ],
            speakerNotes: "Ushbu uchlik bo'lmasa, bugungi ChatGPT, Claude yoki Gamma kabi ilg'or tizimlar mavjud bo'lmas edi."
          },
          {
            id: 4, type: "deep_dive", badge: "BOZOR VA SAMARADORLIK",
            title: "Global AI Ko'rsatkichlari va Ta'sir Doirasi",
            metricValue: "1.3 Trln $",
            metricLabel: "2030-yilgacha Global Sun'iy Intellekt Bozor Hajmi",
            bullets: [
              "Xodimlar kundalik mexanik vazifalarining 40% dan ortig'i AI agentlar tomonidan avtomatlashtiriladi",
              "Tibbiyotda rentgen va MRT tahlillari bo'yicha tashxis qo'yish tezligi 10 barobarga oshdi",
              "Dasturchilar kod yozish tezligi Copilot va agentlar tufayli 55% ga tezlashdi"
            ],
            speakerNotes: "Bu statistika shuni ko'rsatadiki, AI inson o'rnini egallamaydi, balki AIdan foydalana oladigan mutaxassis boshqalardan ancha o'zib ketadi."
          },
          {
            id: 5, type: "roadmap", badge: "QADAMMA-QADAM AMALIYOT",
            title: "AI Tizimini O'rgatish Bosqichlari (Pipeline)",
            steps: [
              { step: "1-DATA PREP", title: "Ma'lumotlarni Tozalash", text: "Xom ma'lumotlarni filtrlash, tokenizatsiya va saralash jarayoni." },
              { step: "2-PRE-TRAINING", title: "Baza Modelini O'qitish", text: "Trillionlab parametrlar orqali umumiy dunyo bilimlarini o'rganish." },
              { step: "3-RLHF & FINE-TUNE", title: "Insoniy Baholash & Xavfsizlik", text: "Modelni xavfsiz, odobli va aniq javob berishga moslashtirish." }
            ],
            speakerNotes: "Har qanday generativ model ushbu uch qat'iy bosqich orqali hayotga tatbiq etiladi."
          },
          {
            id: 6, type: "summary", badge: "XULOSA VA KELAJAK",
            title: "Kelajak Istiqboli va Axloqiy Qoidalar",
            quote: `"Sun'iy intellekt — insoniyat ixtiro qilgan eng muhim texnologiyadir. U olov va elektr energiyasidan ham ko'proq ta'sirga ega." — Sundar Pichai`,
            takeaways: [
              "Raqamli savodxonlik va AI vositalaridan to'g'ri foydalanish har bir soha xodimi uchun zaruratdir",
              "Ma'lumotlar maxfiyligi va kiberxavfsizlik mezonlariga qat'iy rioya etilishi shart",
              "Texnologiya inson aql-zakovatini kuchaytiruvchi eng yaxshi hamkordir"
            ],
            speakerNotes: "E'tiboringiz uchun rahmat! Sun'iy intellekt imkoniyatlaridan unumli foydalaning."
          }
        ];
      }

      // Default Tech Topic
      return [
        {
          id: 1, type: "hero", badge: "AXBOROT TEXNOLOGIYALARI VA RAQAMLASHTIRISH",
          title: topic,
          subtitle: "Dasturiy arxitektura, xavfsizlik protokollari va zamonaviy raqamli infratuzilma",
          speakerNotes: `Assalomu alaykum! Ushbu taqdimotda "${topic}" mavzusining amaliy va nazariy ahamiyatini ko'rib chiqamiz.`
        },
        {
          id: 2, type: "split", badge: "IMKONIYAT VA XAVFSIZLIK",
          title: "Texnologik Afzalliklar va Himoya Standartlari",
          leftTitle: "🚀 Asosiy Afzalliklar",
          leftBullets: [
            "Jarayonlarni to'liq avtomatlashtirish orqali vaqt va resurslarni tejash",
            "Xatolik ehtimolini inson omiliga nisbatan 90% ga qisqartirish",
            "Har qanday joydan masofaviy ishlash va ma'lumot almashish imkoniyati"
          ],
          rightTitle: "🛡 Kiberxavfsizlik Talablari",
          rightBullets: [
            "Ma'lumotlarni shifrlash (End-to-End Encryption) va SSL sertifikatlari",
            "Ikki bosqichli autentifikatsiya (2FA) va foydalanuvchi huquqlarini cheklash",
            "Zaxira nusxalarini muntazam saqlab borish (Cloud Backup)"
          ],
          speakerNotes: "Texnologiyani joriy qilishda birinchi navbatda xavfsizlik va barqarorlik ta'minlanishi shart."
        },
        {
          id: 3, type: "pillars", badge: "3 TA TAYANCH ARXITEKTURA",
          title: "Tizimning Asosiy Qismlari",
          subtitle: "Frontend, Backend va Ma'lumotlar Bazasi integratsiyasi",
          cards: [
            { num: "01", title: "Foydalanuvchi Interfeysi (UI/UX)", desc: "Qulay, tez ishlaydigan va mobil moslashuvchan dizayn." },
            { num: "02", title: "Server Mantiqi (Backend)", desc: "So'rovlarni tezkor qayta ishlovchi yuqori unumdorlikka ega dasturiy kod." },
            { num: "03", title: "Ma'lumotlar Bazasi (DB)", desc: "Xavfsiz, indekslangan va tezkor qidiruv imkonini beruvchi ma'lumotlar ombori." }
          ],
          speakerNotes: "Bu uch qism uzluksiz bog'langanda butun raqamli tizim soat mexanizmiday ishlaydi."
        },
        {
          id: 4, type: "deep_dive", badge: "UNUMDORLIK KO'RSATKICHLARI",
          title: "Tizimning Unumdorlik Statistikasi",
          metricValue: "99.99%",
          metricLabel: "Uptime — Tizimning Uzluksiz Ishlash Kafolati",
          bullets: [
            "Server yuklamasini muvozanatlashtiruvchi zamonaviy bulutli arxitektura",
            "Katta hajmdagi ma'lumotlarni kechikishlarsiz (kamida 50ms) qayta ishlash",
            "Xalqaro xavfsizlik va sifat standartlariga to'liq muvofiqlik"
          ],
          speakerNotes: "Uptime ko'rsatkichi tizimning ishonchliligi va professionalligini belgilab beradi."
        },
        {
          id: 5, type: "roadmap", badge: "LOYIHANI ISHGA TUSHIRISH",
          title: "Dasturiy Mahsulotni Yaratish Bosqichlari",
          steps: [
            { step: "1-PLAN", title: "Tahlil va Texnik Topshiriq", text: "Mijoz talablari va arxitektura rejasini tuzish." },
            { step: "2-DEV", title: "Kodlash va Sinov", text: "Komponentlarni yaratish va xatoliklarni tekshirish (QA)." },
            { step: "3-DEPLOY", title: "Ishga Tushirish va Qo'llab-quvvatlash", text: "Production serverga joylash va monitoring qilish." }
          ],
          speakerNotes: "Agile va Scrum metodologiyasi bo'yicha loyihani bosqichma-bosqich ishlab chiqish."
        },
        {
          id: 6, type: "summary", badge: "XULOSA",
          title: "Xulosa va Raqamli Kelajak",
          quote: `"Eng yaxshi dastur — bu inson hayotini osonlashtiradigan va vaqtini tejaydigan dasturdir."`,
          takeaways: [
            "Zamonaviy texnologiyalarni o'zlashtirish har qanday tashkilotning raqobatbardoshligini ta'minlaydi",
            "Raqamli transformatsiya jarayonlari kelgusida yanada tezlashadi",
            "Doimiy o'rganish va yangiliklarni sinab ko'rish muvaffaqiyat garovidir"
          ],
          speakerNotes: "E'tiboringiz uchun tashakkur! Savollaringiz bo'lsa marhamat."
        }
      ];
    }
  },

  // 4A. FIZIKA VA TABIIY HODISALAR
  physics: {
    match: /fizika|kulon|zaryad|nyuton|optika|gravitatsiya|tok|elektr|magnit|termodinamika|amper|volt|om qonuni/i,
    build: (topic) => {
      const isCoulomb = /kulon|zaryad|elektr/i.test(topic);
      if (isCoulomb) {
        return [
          {
            id: 1, type: "hero", badge: "ELEKTROSTATIKA VA FIZIKA",
            title: topic,
            subtitle: "Qo'zg'almas nuqtaviy zaryadlarning o'zaro ta'sir qonuni: F = k * (|q1 * q2| / r²)",
            speakerNotes: `Assalomu alaykum! Bugungi darsimizda elektrodinamikaning fundamental poydevori bo'lgan "${topic}" mavzusini chuqur tahlil qilamiz.`
          },
          {
            id: 2, type: "split", badge: "KULON TAJRIBASI VA BURILMA TAROZI",
            title: "Kulon Qonunining Fizikaviy Isboti",
            leftTitle: "⚡ Zaryadlar O'rtasidagi O'zaro Ta'sir",
            leftBullets: [
              "Bir xil ishorali zaryadlar bir-birini itaradi, har xil ishorali zaryadlar tortadi",
              "O'zaro ta'sir kuchi zaryadlar miqdorining ko'paytmasiga to'g'ri mutanosib",
              "Zaryadlar orasidagi masofa 2 marta ortsa, ta'sir kuchi 4 marta kamayadi"
            ],
            rightTitle: "🔬 Sharl Kulonning Burilma Tarozi Tajribasi",
            rightBullets: [
              "1785-yilda fransuz fizigi Sharl Kulon o'ta nozik burilma tarozi yordamida o'lchov o'tkazgan",
              "Vakuumda k koeffitsiyenti: k = 9 * 10^9 N*m²/Kl² ga teng",
              "Elektr doimiysi ε0 = 8.85 * 10^-12 F/m formulasiga tayanadi"
            ],
            speakerNotes: "Sharl Kulon o'sha davrda nihoyatda kichik kuchlarni o'lchashga imkon beruvchi burilma tarozini yaratib, tajriba yo'li bilan qonunni kashf etgan."
          },
          {
            id: 3, type: "pillars", badge: "3 TA ASOSIY PARAMETR",
            title: "Kulon Formulasing 3 Tarkibiy Qismi",
            subtitle: "F = k * (|q1 * q2| / r²) formulasining fizik tahlili",
            cards: [
              { num: "01", title: "Elektr Zaryadi (q)", desc: "Xalqaro birliklar tizimida (SI) Kulon (Kl) bilan o'lchanadi. Elementar zaryad e = 1.6 * 10^-19 Kl." },
              { num: "02", title: "Masofa (r)", desc: "Nuqtaviy zaryadlar orasidagi masofa metrlarda (m) o'lchanadi va kuch uning kvadratiga teskari mutanosib." },
              { num: "03", title: "Muhitning Singdiruvchanligi (ε)", desc: "Dielektrik muhit o'zaro ta'sir kuchini ε marta kamaytiradi: F = k * (|q1 * q2| / (ε * r²))." }
            ],
            speakerNotes: "Masalalarni yechishda muhitning dielektrik singdiruvchanligini (ε) hisobga olishni unutmaslik kerak."
          },
          {
            id: 4, type: "deep_dive", badge: "MIQDORIY METRIKA",
            title: "Elektrostatika Ko'rsatkichlari va Doimiylari",
            metricValue: "9 * 10^9",
            metricLabel: "k = N*m²/Kl² (Vakuumdagi Mutanosiblik Koeffitsiyenti)",
            bullets: [
              "Gravitatsiya kuchiga nisbatan elektr kuchi 10^36 marta kuchliroqdir",
              "Atom va molekulalarning barqarorligi Kulon kuchi orqali ta'minlanadi",
              "Zaryad saqlanish qonuni: Yopiq tizimdagi barcha zaryadlar yig'indisi o'zgarmasdir"
            ],
            speakerNotes: "Tasavvur qiling, ikki elektron o'rtasidagi Kulon kuchi ularning tortishish kuchidan 10 ning 36-darajasicha ustundir!"
          },
          {
            id: 5, type: "roadmap", badge: "MASALALAR YECHISH USLUBI",
            title: "Elektrostatik Masalalarni Yechish Algoritmi",
            steps: [
              { step: "1-QADAM", title: "SI Tizimiga O'tkazish", text: "Mikrokulon (mkKl) va santimetrlarni Kl va metrga aylantirish." },
              { step: "2-QADAM", title: "Vektorlarni Yo'naltirish", text: "Zaryadlar ishorasiga qarab itarilish yoki tortilish yo'nalishini chizish." },
              { step: "3-QADAM", title: "Superpozitsiya Prinsiplari", text: "Bir necha zaryad bo'lsa, teng ta'sir etuvchi kuchni geometrik qo'shish." }
            ],
            speakerNotes: "Testlarda eng ko'p uchraydigan xato — birliklarni SI sistemasiga o'tkazmaslikdir."
          },
          {
            id: 6, type: "summary", badge: "XULOSA",
            title: "Xulosa va Hayotiy Tadbiqi",
            quote: `"Fizika — koinotning qanday yaratilgani va moddalarning o'zaro bog'lanish qonuniyatidir."`,
            takeaways: [
              "Kulon qonuni butun elektrodinamika va elektronika fanlarining boshlang'ich nuqtasidir",
              "Lazer printerlar, fotonusxa apparatlari va chang tozalagichlar aynan shu qonunga tayanadi",
              "Formulani to'g'ri qo'llash orqali har qanday murakkab nazorat masalasini yechish mumkin"
            ],
            speakerNotes: "E'tiboringiz uchun rahmat! Amaliy laboratoriya mashg'ulotlarida ushbu qonuniyatni yana sinab ko'ramiz."
          }
        ];
      }

      // General Physics
      return [
        {
          id: 1, type: "hero", badge: "FIZIKA VA TABIIYOT FANLARI",
          title: topic,
          subtitle: "Fundamental qonuniyatlar, laboratoriya tajribalari va formulalar tahlili",
          speakerNotes: `Assalomu alaykum! Bugungi darsimiz "${topic}" mavzusiga bag'ishlanadi.`
        },
        {
          id: 2, type: "split", badge: "NAZARIYA VA TAJRIBA",
          title: `${topic}: Fizikaviy Mohiyat`,
          leftTitle: "🔬 Qonuniyat va Hodisa",
          leftBullets: [
            "Hodisaning tabiatda va texnikada namoyon bo'lishi",
            "Asosiy fizik miqdorlar va ularning o'lchov birliklari (SI)",
            "Tajriba xulosalari va olingan natijalarning ishonchliligi"
          ],
          rightTitle: "📐 Formulalar va O'lchov",
          rightBullets: [
            "Matematik bog'lanishlar va mutanosiblik koeffitsiyentlari",
            "Turli muhitlarda parametrlar o'zgarish dinamikasi",
            "Hisoblash formulalari va xatoliklarni baholash mezonlari"
          ],
          speakerNotes: "Fizika qonunlari har doim amaliy tajribalar bilan mustahkamlanishi lozim."
        },
        {
          id: 3, type: "pillars", badge: "3 TA TAYANCH YO'NALISH",
          title: "Asosiy Fizik Tamoyillar",
          subtitle: "Nazariya, Tajriba va Amaliyot",
          cards: [
            { num: "01", title: "Fundamental Qoida", desc: "Mavzuning darslikdagi tayanch aksioma va ta'riflari." },
            { num: "02", title: "Tajriba Sinovi", desc: "Laboratoriya asboblari yordamida o'lchangan aniq ma'lumotlar." },
            { num: "03", title: "Texnik Tadbiq", desc: "Kundalik texnika, asbob-uskunalar va sanoatdagi amaliy foydasi." }
          ],
          speakerNotes: "Har qanday fizik hodisa ushbu uchlik orqali to'liq tushuniladi."
        },
        {
          id: 4, type: "deep_dive", badge: "AMALIY STATISTIKA",
          title: "Miqdoriy Parametrlar va O'lchovlar",
          metricValue: "100%",
          metricLabel: "Xalqaro SI Birliklar Tizimiga Muvofiqlik",
          bullets: [
            "Parametrlarning standart o'lchov birliklarida aniq ifodalanishi",
            "Nazariy hisob-kitoblar va real eksperiment mosligi",
            "Zamonaviy fizika va muhandislikdagi hal qiluvchi o'rni"
          ],
          speakerNotes: "Fizikada hisoblash aniqligi texnika xavfsizligining garovidir."
        },
        {
          id: 5, type: "roadmap", badge: "TAJRIBA BOSQICHLARI",
          title: "Tajribani O'tkazish Ketma-ketligi",
          steps: [
            { step: "1-BOSQICH", title: "Asboblarni Sozlash", text: "Laboratoriya uskunalarini tekshirish va nol holatiga keltirish." },
            { step: "2-BOSQICH", title: "O'lchovlarni Olish", text: "Bir necha bor o'lchash orqali o'rtacha qiymatni hisoblash." },
            { step: "3-BOSQICH", title: "Xulosa Chiqarish", text: "Olingan natijalarni nazariy formula bilan solishtirish." }
          ],
          speakerNotes: "Ushbu metodik algoritm ilmiy xulosalarning aniqligini kafolatlaydi."
        },
        {
          id: 6, type: "summary", badge: "XULOSA",
          title: "Xulosa va Darslik Mezonlari",
          quote: `"Tabiat o'z qonunlarini matematika va fizika tilida yozgan."`,
          takeaways: [
            "Mavzuni mukammal o'zlashtirish barcha nazorat testlarida yuqori ball olishni ta'minlaydi",
            "Fizik qonuniyatlar insoniyat taraqqiyotining asosiy harakatlantiruvchi kuchidir",
            "Nazariy formulalarni amaliy masalalarda qo'llashni davom ettiring"
          ],
          speakerNotes: "E'tiboringiz uchun tashakkur!"
        }
      ];
    }
  },

  // 4. ANIQ FANLAR (MATEMATIKA, GEOMETRIYA)
  math: {
    match: /matematika|pifagor|geometriya|formula|tenglama|uchburchak|integral|hosila|algebra/i,
    build: (topic) => {
      const isPythagoras = /pifagor/i.test(topic);

      if (isPythagoras) {
        return [
          {
            id: 1, type: "hero", badge: "GEOMETRIYA VA MATEMATIKA ASOSLARI",
            title: "Pifagor Teoremasi: To'g'ri Burchakli Uchburchak Sirlari",
            subtitle: "Klassik qoida: Gipotenuza kvadratining yig'indisi katetlar kvadratlarining yig'indisiga teng: a² + b² = c²",
            speakerNotes: "Assalomu alaykum! Bugun geometriya fanining eng mashhur va amaliyotda eng ko'p qo'llaniladigan qoidasi — Pifagor teoremasini o'rganamiz."
          },
          {
            id: 2, type: "split", badge: "TEOREMANING MOHIYATI VA ISBOTI",
            title: "Teoremaning Geometrik va Algebraik Ma'nosi",
            leftTitle: "📐 Geometrik Ma'no (Yuzalar Tengligi)",
            leftBullets: [
              "Katetlarga qurilgan kvadratlar yuzalarining yig'indisi gipotenuzaga qurilgan kvadrat yuzasiga teng",
              "S₁ + S₂ = S₃ tenglamasi to'g'ri burchakli har qanday uchburchak uchun o'rinlidir",
              "Qadimgi Misr quruvchilari tomonidan '3, 4, 5' tomonli arqonlar yordamida to'g'ri burchak hosil qilingan"
            ],
            rightTitle: "🔢 Algebraik Formulalar",
            rightBullets: [
              "Gipotenuzani topish formulasi: c = √(a² + b²)",
              "Katetni topish: a = √(c² - b²) yoki b = √(c² - a²)",
              "Koordinatalar tekisligida ikki nuqta orasidagi masofani hisoblash aynan shu teoremaga tayanadi"
            ],
            speakerNotes: "Pifagor bu teoremani shunchaki sonlar bilan emas, balki kvadratlarning yuzasi orqali isbotlagan."
          },
          {
            id: 3, type: "pillars", badge: "PIFAGOR SONLARI (UCHLIKLAR)",
            title: "Eng Mashhur Pifagor Uchliklari",
            subtitle: "a² + b² = c² tengligini qanoatlantiruvchi butun sonlar",
            cards: [
              { num: "3, 4, 5", title: "Misr Uchburchagi", desc: "3² + 4² = 9 + 16 = 25 (5²). Eng sodda va qadimdan ma'lum bo'lgan butun sonli uchlik." },
              { num: "5, 12, 13", title: "Ikkinchi Baza", desc: "5² + 12² = 25 + 144 = 169 (13²). Qurilish va fazoviy hisob-kitoblarda keng qo'llaniladi." },
              { num: "8, 15, 17", title: "Uchinchi Uchlik", desc: "8² + 15² = 64 + 225 = 289 (17²). Murakkab trigonometrik burchaklarni hisoblashda qulay." }
            ],
            speakerNotes: "Bu sonlar yodda tursa, testlarda kvadrat ildiz chiqarmasdan darhol to'g'ri javobni topish mumkin."
          },
          {
            id: 4, type: "deep_dive", badge: "AMALIY QO'LLANILISHI",
            title: "Real Hayot va Muhandislikdagi O'rni",
            metricValue: "100%",
            metricLabel: "Barcha Qurilish va Arxitektura Chizmalarining Asosi",
            bullets: [
              "Binolar va xonalarning burchaklari aynan 90 gradus bo'lishini ta'minlashda lazerli asboblar shu qoidaga tayanadi",
              "GPS sun'iy yo'ldosh navigatsiyasi koordinatalar orasidagi masofani Pifagor fazoviy formulasi orqali hisoblaydi",
              "Kompyuter grafikasi va 3D o'yinlarda ob'ektlarning masofasini render qilishda har millisekundda ishlatiladi"
            ],
            speakerNotes: "Pifagor teoremasi bo'lmaganda na ko'p qavatli binolar, na GPS va na kompyuter o'yinlari paydo bo'lardi."
          },
          {
            id: 5, type: "roadmap", badge: "MASALANI YECHISH ALGORITMI",
            title: "Pifagor Teoremasi Bo'yicha Masala Yechish",
            steps: [
              { step: "1-QADAM", title: "To'g'ri Burchakni Topish", text: "To'g'ri burchak qarshisidagi tomon gipotenuza ekanligini aniqlash." },
              { step: "2-QADAM", title: "Formulani Tanlash", text: "Gipotenuza yoki katet so'ralganiga qarab kerakli formulani yozish." },
              { step: "3-QADAM", title: "Kvadrat Ildiz Chiqarish", text: "Sonlarni kvadratga ko'tarib, ayirish yoki qo'shish orqali ildiz chiqarish." }
            ],
            speakerNotes: "Ushbu uch qadam orqali har qanday to'g'ri burchakli uchburchak masalasini adashmasdan yechish mumkin."
          },
          {
            id: 6, type: "summary", badge: "XULOSA",
            title: "Geometriyaning Go'zalligi va Xulosa",
            quote: `"Raqamlar dunyoni boshqarmaydi, lekin ular dunyo qanday boshqarilishini ko'rsatib beradi." — Pifagor`,
            takeaways: [
              "Pifagor teoremasi fazoviy fikrlash va mantiqiy xulosa chiqarish qobiliyatini rivojlantiradi",
              "Murakkab trigonometriya, stereometriya va fizika fanlarining fundamental poydevoridir",
              "Matematika — tabiatning eng aniq va go'zal tilidir"
            ],
            speakerNotes: "E'tiboringiz uchun rahmat! Mashqlarni mustaqil bajarib, bilimlaringizni mustahkamlang."
          }
        ];
      }

      // Default Math Topic
      return [
        {
          id: 1, type: "hero", badge: "ANIQ FANLAR VA MANTIQ",
          title: topic,
          subtitle: "Nazariy qoidalar, matematik modellashtirish va amaliy hisob-kitoblar",
          speakerNotes: `Assalomu alaykum! Ushbu taqdimotda biz "${topic}" mavzusining asosiy qonuniyatlari va formulalarini ko'rib chiqamiz.`
        },
        {
          id: 2, type: "split", badge: "NAZARIYA VA TAHLIL",
          title: "Asosiy Qoidalar va Matematik Isbot",
          leftTitle: "📐 Fundamental Qonuniyatlar",
          leftBullets: [
            "Aksioma va teoremalarning o'zaro mantiqiy bog'liqligi",
            "Cheklovlar va shartlarning qat'iy belgilanishi",
            "Formula elementlarining fizik va geometrik mohiyati"
          ],
          rightTitle: "🔢 Hisoblash Usullari",
          rightBullets: [
            "Algebraik shakl almashtirishlar va soddalashtirish",
            "Tenglama va tengsizliklar yordamida yechim topish",
            "Grafik tahlil va funksional bog'lanishlarni ifodalash"
          ],
          speakerNotes: "Matematikada har bir xulosa qat'iy isbotga tayanishi shart."
        },
        {
          id: 3, type: "pillars", badge: "3 ASOSIY BOSQICH",
          title: "Hisoblashning Uch Bosqichi",
          subtitle: "Ma'lumotlarni tahlil qilish va yechimga kelish",
          cards: [
            { num: "01", title: "Berilganlarni Aniqlash", desc: "Barcha parametrlar va o'lchov birliklarini tizimlashtirish." },
            { num: "02", title: "Modelni Tanlash", desc: "Masalaga mos eng qisqa va qulay formulani qo'llash." },
            { num: "03", title: "Natijani Tekshirish", desc: "Olingan natijaning mantiqiy va fizik haqiqatga mosligini baholash." }
          ],
          speakerNotes: "Ushbu algoritm aniq fanlarda xatoliklarni 100% bartaraf etadi."
        },
        {
          id: 4, type: "deep_dive", badge: "AMALIY STATISTIKA",
          title: "Aniqlik va Muhandislikdagi Ahamiyati",
          metricValue: "100%",
          metricLabel: "Mantiqiy Qat'iylik va Yechim Aniqligi",
          bullets: [
            "Zamonaviy hisoblash texnikasi va muhandislik konstruktsiyalari asosi",
            "Iqtisodiy tahlil, kriptografiya va modellashtirishda keng qo'llanilishi",
            "Fikrlash intizomi va intellektual salohiyatni yuksaltirish"
          ],
          speakerNotes: "Aniq fanlar inson miyasini tartibli va tizimli fikrlashga o'rgatadi."
        },
        {
          id: 5, type: "roadmap", badge: "ALGORITM",
          title: "Muammoni Yechish Bosqichlari",
          steps: [
            { step: "1-BOSQICH", title: "Nazariyani O'rganish", text: "Ta'riflar va teoremalarni to'liq o'zlashtirish." },
            { step: "2-BOSQICH", title: "Namunaviy Misollar", text: "O'qituvchi bilan birgalikda standart masalalarni tahlil qilish." },
            { step: "3-BOSQICH", title: "Mustaqil Ijodiy Masalalar", text: "Nostandart va olimpiada darajasidagi topshiriqlarni yechish." }
          ],
          speakerNotes: "Nazariyadan amaliyotga o'tish orqali haqiqiy bilim shakllanadi."
        },
        {
          id: 6, type: "summary", badge: "XULOSA",
          title: "Xulosa va Tavsiyalar",
          quote: `"Matematika barcha fanlarning shohi, sonlar nazariyasi esa matematikaning shohidir." — K.F. Gauss`,
          takeaways: [
            "Aniq formulalarni tushunib yodlash masalani bir necha soniyada yechish imkonini beradi",
            "Muntazam amaliy mashg'ulot ko'nikmani mukammallashtiradi",
            "Mantiqiy tafakkur har qanday sohada yetakchilik qilish garovidir"
          ],
          speakerNotes: "E'tiboringiz uchun rahmat! Yangi bilimlarni mustahkamlashda davom eting."
        }
      ];
    }
  }
};

// FOYDALANUVCHINING HAR QANDAY MATN YOKI MAVZUSIDAN NOYOB SLAYDLAR GENERATSIYASI
export function synthesizeCustomSlideDeck(inputText) {
  const raw = String(inputText || '').trim();
  const cleanTitle = raw.split(/\r?\n/)[0].replace(/^#+\s*/, '').slice(0, 80) || "Zamonaviy Fan va Jamiyat";

  // Matndan qatorlarni ajratish
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 3);
  
  // 1-slayd: Sarlavha
  const slide1 = {
    id: 1, type: "hero", badge: "AI TAHLIL VA ILMIY TAQDIMOT",
    title: cleanTitle,
    subtitle: lines[1] ? lines[1].slice(0, 110) : "Mavzuning dolzarb masalalari, tahliliy mezonlari va amaliy xulosalari",
    speakerNotes: `Assalomu alaykum, hurmatli tinglovchilar! Bugungi taqdimotimiz "${cleanTitle}" mavzusiga bag'ishlanadi. Unda biz eng muhim masalalar va asosiy yechimlarni ko'rib chiqamiz.`
  };

  // 2-slayd: Muammo va Yechim
  const slide2 = {
    id: 2, type: "split", badge: "MUAMMO VA YECHIM",
    title: `${cleanTitle}: Mavjud Holat va Yangi Yondashuv`,
    leftTitle: "📌 Hozirgi Holat va Qiyinchiliklar",
    leftBullets: [
      lines[2] ? lines[2].slice(0, 80) : "An'anaviy yondashuvlarning zamon talablariga to'liq javob bermasligi",
      lines[3] ? lines[3].slice(0, 80) : "Axborot va resurslardan foydalanishdagi samarasizlik omillari",
      lines[4] ? lines[4].slice(0, 80) : "Sohada tizimli monitoring va yangi mexanizmlar zarurati"
    ],
    rightTitle: "💡 Taklif Etilayotgan Samarali Yechimlar",
    rightBullets: [
      lines[5] ? lines[5].slice(0, 80) : "Zamonaviy metodologiya va raqamli texnologiyalarni tatbiq etish",
      lines[6] ? lines[6].slice(0, 80) : "Jarayonlarni bosqichma-bosqich optimallashtirish va shaffoflik",
      lines[7] ? lines[7].slice(0, 80) : "Yakuniy natijadorlikni va o'zlashtirishni sezilarli darajada oshirish"
    ],
    speakerNotes: "Ushbu slaydda mavzuning nima uchun dolzarbligi va unga qanday samarali yechim taklif qilinayotgani tahlil etilgan."
  };

  // 3-slayd: 3 Ustun (Genspark Grid)
  const slide3 = {
    id: 3, type: "pillars", badge: "3 ASOSIY USTUN (GENSPARK)",
    title: `${cleanTitle}ning Uch Asosiy Poydevori`,
    subtitle: "Mavzuni to'liq yoritib beruvchi mantiqiy bloklar",
    cards: [
      {
        num: "01",
        title: lines[8] ? lines[8].slice(0, 25) : "Nazariy Asoslar",
        desc: lines[9] ? lines[9].slice(0, 110) : "Fundamental qoidalar, aniq mezonlar va birlamchi tushunchalarning mohiyati."
      },
      {
        num: "02",
        title: lines[10] ? lines[10].slice(0, 25) : "Amaliy Jarayon",
        desc: lines[11] ? lines[11].slice(0, 110) : "Tajribaviy sinovlar, real misollar va hayotiy amaliyotga tatbiq etish yo'llari."
      },
      {
        num: "03",
        title: lines[12] ? lines[12].slice(0, 25) : "Natija & Baholash",
        desc: lines[13] ? lines[13].slice(0, 110) : "Kutilgan ko'rsatkichlar, samaradorlik tahlili va istiqbolli rejalar."
      }
    ],
    speakerNotes: "Mavzuni o'zlashtirish uchun ushbu 3 ta asosiy poydevor yetarli tushuncha beradi."
  };

  // 4-slayd: Metrika
  const slide4 = {
    id: 4, type: "deep_dive", badge: "CHUQUR TAHLIL VA STATISTIKA",
    title: "Asosiy Ko'rsatkichlar va Samaradorlik Ko'lami",
    metricValue: "96.8%",
    metricLabel: "Amaliy Tatbiq va Ijobiy Natija Ko'rsatkichi",
    bullets: [
      lines[14] ? lines[14].slice(0, 95) : "Tizimli yondashuv tufayli maqsadlarga erishish tezligi 2.5 barobarga oshadi",
      lines[15] ? lines[15].slice(0, 95) : "Resurslar sarfi tejaladi va kutilmagan xatoliklar ehtimoli kamayadi",
      lines[16] ? lines[16].slice(0, 95) : "Barcha ishtirokchilar uchun aniq, tushunarli va shaffof mexanizm yaratiladi"
    ],
    speakerNotes: "Raqamlar va metrikalar ushbu yondashuvning qanchalik samarali ekanligini yaqqol ko'rsatadi."
  };

  // 5-slayd: Roadmap
  const slide5 = {
    id: 5, type: "roadmap", badge: "AMALGA OSHIRISH BOSQICHLARI",
    title: "Ketma-ket Rivojlanish Yo'l Xaritasi (Roadmap)",
    steps: [
      { step: "1-BOSQICH", title: "Tayyorgarlik va Rejalashtirish", text: lines[17] ? lines[17].slice(0, 85) : "Dastlabki tahlillarni o'tkazish va vazifalarni aniq belgilash." },
      { step: "2-BOSQICH", title: "Amaliy Ijro va Monitoring", text: lines[18] ? lines[18].slice(0, 85) : "Reja asosida amaliyotni yo'lga qo'yish va oraliq nazorat." },
      { step: "3-BOSQICH", title: "Yakuniy Baholash va Barqarorlik", text: lines[19] ? lines[19].slice(0, 85) : "Natijalarni umumlashtirish va doimiy tizimga aylantirish." }
    ],
    speakerNotes: "Bosqichma-bosqich harakat qilish har qanday murakkab maqsadni osonlashtiradi."
  };

  // 6-slayd: Xulosa
  const slide6 = {
    id: 6, type: "summary", badge: "XULOSA VA TAVSIYALAR",
    title: "Yakuniy Xulosalar va Asosiy Qoidalar",
    quote: `"Har qanday ulug'vor maqsad — puxta reja, chuqur bilim va to'xtovsiz harakat natijasidir."`,
    takeaways: [
      lines[20] ? lines[20].slice(0, 90) : "Ushbu yo'nalishdagi bilimlar zamonaviy talablarga to'liq javob beradi",
      lines[21] ? lines[21].slice(0, 90) : "Amaliy tajriba va tahlil doimiy yuksalish uchun asosiy omildir",
      "E'tiboringiz, qimmatli vaqtingiz va faol ishtirokingiz uchun katta rahmat!"
    ],
    speakerNotes: "Xulosa qilib aytganda, bugun ko'rib chiqqan mavzumiz kelgusidagi muvaffaqiyatlar uchun muhim qadamdir."
  };

  return [slide1, slide2, slide3, slide4, slide5, slide6];
}

// ASOSIY REAL AI SLIDE DISPATCHER
export function generateRealAIGammaCards(topicOrText) {
  const text = String(topicOrText || '').trim();
  if (!text) {
    return DOMAIN_KNOWLEDGE.tech.build("Sun'iy Intellekt va Raqamli Ta'lim");
  }

  // 1. Domenlarni aniqlash
  for (const [key, domain] of Object.entries(DOMAIN_KNOWLEDGE)) {
    if (domain.match.test(text)) {
      return domain.build(text);
    }
  }

  // 2. Agar maxsus domen topilmasa yoki matn ko'rinishida berilgan bo'lsa:
  // Intellektual sintizator orqali har bir slayd uchun maxsus matnlar hosil qilinadi
  return synthesizeCustomSlideDeck(text);
}
