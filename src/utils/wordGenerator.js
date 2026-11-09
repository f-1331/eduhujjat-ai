import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel
} from 'docx';
import { saveAs } from 'file-saver';

// 1. O'quvchilar ro'yxatini Word jadvaliga aylantirish
export async function generateStudentListDocx(students, title = "O'QUVCHILARNING RASMIY TARTIBLANGAN RO'YXATI", filename = "O'quvchilar_Ro'yxati.docx") {
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: [
        createHeaderCell("№", 800),
        createHeaderCell("Familiya Ism Sharifi", 3500),
        createHeaderCell("Tug'ilgan sana", 1800),
        createHeaderCell("Yoshi", 1200),
        createHeaderCell("Sinfi", 1200),
        createHeaderCell("Telefon", 2200),
        createHeaderCell("Jinsi", 1200),
      ],
    }),
    ...students.map((s, idx) => new TableRow({
      children: [
        createCell(`${idx + 1}`, 800, AlignmentType.CENTER, idx % 2 === 1),
        createCell(s.fullName || '', 3500, AlignmentType.LEFT, idx % 2 === 1),
        createCell(s.birthDate || '-', 1800, AlignmentType.CENTER, idx % 2 === 1),
        createCell(s.ageText || '-', 1200, AlignmentType.CENTER, idx % 2 === 1),
        createCell(s.grade || '-', 1200, AlignmentType.CENTER, idx % 2 === 1),
        createCell(s.phone || '-', 2200, AlignmentType.CENTER, idx % 2 === 1),
        createCell(s.gender === 'male' ? "O'g'il" : s.gender === 'female' ? "Qiz" : '-', 1200, AlignmentType.CENTER, idx % 2 === 1),
      ]
    }))
  ];

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } // 2cm / 3cm
        }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI", bold: true, size: 22, font: 'Times New Roman', color: "1E3A8A" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 150 },
          children: [new TextRun({ text: "UMUMIY O'RTA TA'LIM MAKTABI RASMIY HUJJATI", bold: true, size: 18, font: 'Times New Roman' })]
        }),
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200 },
          children: [new TextRun({ text: `Sana: ${new Date().toLocaleDateString('uz-UZ')} | Tasdiqlangan nusxa`, size: 18, font: 'Times New Roman', italics: true })]
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        }),
        new Paragraph({
          spacing: { before: 400 },
          children: [new TextRun({ text: "Maktab direktori:  __________________________   (M.O'. Muhr o'rni)", bold: true, size: 20, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { before: 150 },
          children: [new TextRun({ text: "Sinf rahbari:      __________________________   (Imzo)", bold: true, size: 20, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { before: 300 },
          children: [new TextRun({ text: `Hujjat raqamli tekshiruv kodi: EDU-${Math.floor(100000 + Math.random() * 900000)} | EduHujjat AI Milliy Ta'lim Tizimi`, size: 16, color: "64748B", font: 'Times New Roman', italics: true })]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// 2. Test Generatori (Variantlar bilan va Javoblar kaliti)
export async function generateTestDocx(topic = "O'zbekiston tarixi", questions = [], variantsCount = 2, filename = "Nazorat_Testlari.docx") {
  const letters = ['A', 'B', 'C', 'D'];
  const sections = [];

  // Har bir variant uchun savollarni tayyorlash
  for (let v = 0; v < variantsCount; v++) {
    const variantLetter = String.fromCharCode(65 + v); // A, B, C, D
    const variantChildren = [
      new Paragraph({
        text: `FAN: ${topic.toUpperCase()}`,
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: `FAN: ${topic.toUpperCase()}`, bold: true, size: 28, font: 'Times New Roman' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: `${variantLetter} - VARIANT`, bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: "O'quvchining F.I.Sh: _____________________________________   Sinfi: _______", size: 24, font: 'Times New Roman' })
        ]
      })
    ];

    const answerKey = [];

    // Savollarni aralashtirish (Variant B uchun boshqacha tartib)
    const shuffledQuestions = [...questions].sort(() => (v === 0 ? 0 : 0.5 - Math.random()));

    shuffledQuestions.forEach((q, qIdx) => {
      // Variantlarni aralashtirish
      const originalCorrectOption = q.options[q.correctAnswer];
      const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
      const newCorrectIdx = shuffledOptions.indexOf(originalCorrectOption);
      const correctLetter = letters[newCorrectIdx] || 'A';

      answerKey.push(`${qIdx + 1}-${correctLetter}`);

      variantChildren.push(
        new Paragraph({
          spacing: { before: 180, after: 80 },
          children: [
            new TextRun({ text: `${qIdx + 1}. ${q.question}`, bold: true, size: 24, font: 'Times New Roman' })
          ]
        })
      );

      // A, B, C, D variantlari
      shuffledOptions.forEach((opt, optIdx) => {
        variantChildren.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            indent: { left: 400 },
            children: [
              new TextRun({ text: `${letters[optIdx]}) ${opt}`, size: 22, font: 'Times New Roman' })
            ]
          })
        );
      });
    });

    // Variant oxirida Javoblar kaliti
    variantChildren.push(
      new Paragraph({
        spacing: { before: 400, after: 100 },
        children: [
          new TextRun({ text: `JAVOBLAR KALITI (${variantLetter} - Variant):`, bold: true, size: 24, font: 'Times New Roman' })
        ]
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({ text: answerKey.join(',   '), italic: true, size: 22, font: 'Times New Roman' })
        ]
      })
    );

    sections.push({
      properties: {
        page: {
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 }
        }
      },
      children: variantChildren
    });
  }

  const doc = new Document({ sections });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// 3. 45 daqiqalik Dars Ishlanmasi (Konspekt)
export async function generateLessonPlanDocx(lessonInfo, filename = "Dars_Ishlanmasi_Konspekt.docx") {
  const {
    subject = "O'zbekiston tarixi",
    topic = "Amir Temur davlatining tashkil topishi",
    grade = "8-A sinf",
    teacherName = "Xolmatov Alisher",
    date = "2025/2026-o'quv yili"
  } = lessonInfo;

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 }
        }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "O'ZBEKISTON RESPUBLIKASI MAKTABGACHA VA MAKTAB TA'LIMI VAZIRLIGI", bold: true, size: 24, font: 'Times New Roman' })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: "1 SOATLIK NAMUNAVIY DARS ISHLANMASI (KONSPEKTI)", bold: true, size: 26, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({ text: `Fan: `, bold: true, size: 24, font: 'Times New Roman' }),
            new TextRun({ text: `${subject}       `, size: 24, font: 'Times New Roman' }),
            new TextRun({ text: `Sinf: `, bold: true, size: 24, font: 'Times New Roman' }),
            new TextRun({ text: `${grade}       `, size: 24, font: 'Times New Roman' }),
            new TextRun({ text: `Sana: `, bold: true, size: 24, font: 'Times New Roman' }),
            new TextRun({ text: `${date}`, size: 24, font: 'Times New Roman' }),
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: `O'qituvchi: `, bold: true, size: 24, font: 'Times New Roman' }),
            new TextRun({ text: `${teacherName}`, size: 24, font: 'Times New Roman' })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: `Dars mavzusi: `, bold: true, size: 24, font: 'Times New Roman' }),
            new TextRun({ text: `${topic}`, bold: true, color: '1d4ed8', size: 24, font: 'Times New Roman' })
          ]
        }),
        new Paragraph({
          spacing: { before: 100, after: 100 },
          children: [new TextRun({ text: "DARS MAQSADLARI:", bold: true, size: 24, font: 'Times New Roman' })]
        }),
        new Paragraph({
          indent: { left: 400 },
          children: [new TextRun({ text: "1. Ta'limiy: O'quvchilarga mavzu bo'yicha to'liq tushuncha va amaliy ko'nikmalar berish.", size: 22, font: 'Times New Roman' })]
        }),
        new Paragraph({
          indent: { left: 400 },
          children: [new TextRun({ text: "2. Tarbiyaviy: O'quvchilarda vatanga muhabbat, milliy g'urur va axloqiy fazilatlarni shakllantirish.", size: 22, font: 'Times New Roman' })]
        }),
        new Paragraph({
          indent: { left: 400 },
          spacing: { after: 300 },
          children: [new TextRun({ text: "3. Rivojlantiruvchi: Mantiqiy fikrlash, tahlil qilish va erkin so'zlash qobiliyatini rivojlantirish.", size: 22, font: 'Times New Roman' })]
        }),
        new Paragraph({
          spacing: { before: 100, after: 150 },
          children: [new TextRun({ text: "45 DAQIQALIK DARS BOSQICHLARI TAQSIMOTI:", bold: true, size: 24, font: 'Times New Roman' })]
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                createHeaderCell("Bosqichlar", 2500),
                createHeaderCell("Vaqt", 1000),
                createHeaderCell("O'qituvchi faoliyati", 3500),
                createHeaderCell("O'quvchi faoliyati", 3000),
              ]
            }),
            new TableRow({
              children: [
                createCell("1. Tashkiliy qism", 2500),
                createCell("3 daqiqa", 1000, AlignmentType.CENTER),
                createCell("Salomlashish, davomatni aniqlash, o'quv qurollarini tekshirish.", 3500),
                createCell("Darsga hozirlik ko'rish, navbatchi axborotini taqdim etish.", 3000),
              ]
            }),
            new TableRow({
              children: [
                createCell("2. O'tilgan mavzuni so'rash", 2500),
                createCell("7 daqiqa", 1000, AlignmentType.CENTER),
                createCell("Tezkor savol-javob (blits-savollar), uy vazifasini tekshirish.", 3500),
                createCell("Savollarga faol javob berish, uy ishini ko'rsatish.", 3000),
              ]
            }),
            new TableRow({
              children: [
                createCell("3. Yangi mavzu bayoni", 2500),
                createCell("20 daqiqa", 1000, AlignmentType.CENTER),
                createCell("Mavzuni slaydlar, ko'rgazmali qurollar yordamida batafsil tushuntirish.", 3500),
                createCell("Diqqat bilan tinglash, asosiy tezislarni daftarga qayd etish.", 3000),
              ]
            }),
            new TableRow({
              children: [
                createCell("4. Mavzuni mustahkamlash", 2500),
                createCell("10 daqiqa", 1000, AlignmentType.CENTER),
                createCell("Interaktiv o'yinlar, krossvord yoki test savollarini o'tkazish.", 3500),
                createCell("Guruhlarda ishlash, amaliy misollar yechish.", 3000),
              ]
            }),
            new TableRow({
              children: [
                createCell("5. Baholash va uyga vazifa", 2500),
                createCell("5 daqiqa", 1000, AlignmentType.CENTER),
                createCell("Darsda faol qatnashganlarni rag'batlantirish, uyga vazifa berish.", 3500),
                createCell("Kundalikka baholarni qo'ydirish, uyga vazifani yozib olish.", 3000),
              ]
            })
          ]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// 4. GOST Standartidagi Referat va Mustaqil ish
export async function generateReferatDocx(referatData, filename = "Referat_Mustaqil_Ish.docx") {
  const {
    institution = "O'ZBEKISTON RESPUBLIKASI OLIY TA'LIM, FAN VA INNOVATSIYALAR VAZIRLIGI",
    university = "TOSHKENT DAVLAT PEDAGOGIKA UNIVERSITETI",
    faculty = "Aniq va tabiiy fanlar fakulteti",
    subject = "Informatika va axborot texnologiyalari",
    topic = "Sun'iy intellekt texnologiyalarining zamonaviy ta'limdagi o'rni",
    student = "Karimov Jasur",
    teacher = "Dots. Aliyev N. M.",
    city = "TOSHKENT - 2026"
  } = referatData;

  // GOST standarti: Times New Roman, 14pt (size: 28), 1.5 qator oralig'i (line: 360)
  const gostParagraph = (text, options = {}) => new Paragraph({
    alignment: options.align || AlignmentType.JUSTIFIED,
    spacing: { line: 360, before: options.before || 0, after: options.after || 120 },
    indent: { firstLine: options.firstLine !== false ? 708 : 0 }, // 1.25 cm
    children: [
      new TextRun({
        text,
        font: 'Times New Roman',
        size: 28,
        bold: options.bold || false,
        italics: options.italic || false
      })
    ]
  });

  const doc = new Document({
    sections: [
      // 1-BO'LIM: TITUL VARAG'I
      {
        properties: {
          page: { margin: { top: 1134, right: 850, bottom: 1134, left: 1701 } } // Chap 3cm, o'ng 1.5cm
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [new TextRun({ text: institution, bold: true, size: 22, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [new TextRun({ text: university, bold: true, size: 24, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1400 },
            children: [new TextRun({ text: faculty, italic: true, size: 22, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: "REFERAT / MUSTAQIL ISH", bold: true, size: 36, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: `Mavzu: "${topic}"`, bold: true, size: 28, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1400 },
            children: [new TextRun({ text: `Fan: ${subject}`, size: 24, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 60 },
            children: [new TextRun({ text: `Bajardi: ${student}              `, size: 24, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 1400 },
            children: [new TextRun({ text: `Qabul qildi: ${teacher}          `, size: 24, font: 'Times New Roman' })]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: city, bold: true, size: 24, font: 'Times New Roman' })]
          })
        ]
      },
      // 2-BO'LIM: REJA, KIRISH, ASOSIY QISM, XULOSA, ADABIYOTLAR
      {
        properties: {
          page: { margin: { top: 1134, right: 850, bottom: 1134, left: 1701 } }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [new TextRun({ text: "MUNDARIJA (REJA)", bold: true, size: 28, font: 'Times New Roman' })]
          }),
          gostParagraph("KIRISH ............................................................................................................. 3", { firstLine: false }),
          gostParagraph("I BOB. NAZARIY ASOSLAR VA ZAMONAVIY AHVOL ........................................ 4", { firstLine: false }),
          gostParagraph("II BOB. AMALIY TATBIQ VA SAMARADORLIK TAHLILI ................................ 8", { firstLine: false }),
          gostParagraph("XULOSA .......................................................................................................... 12", { firstLine: false }),
          gostParagraph("FOYDALANILGAN ADABIYOTLAR RO'YXATI ................................................ 13", { firstLine: false, after: 600 }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "KIRISH", bold: true, size: 28, font: 'Times New Roman' })]
          }),
          gostParagraph("Mavzuning dolzarbligi: Bugungi kunda jahon miqyosida va O'zbekiston Respublikasida ta'lim sohasini raqamlashtirish, ilg'or pedagogik va axborot-kommunikatsiya texnologiyalarini keng joriy etish davlat siyosatining ustuvor yo'nalishlaridan biri hisoblanadi."),
          gostParagraph("Ishning maqsadi va vazifalari: Mazkur mustaqil ishning asosiy maqsadi — tanlangan mavzu doirasida ilmiy manbalarni o'rganish, zamonaviy usullarni tadqiq qilish va amaliy xulosalar shakllantirishdan iborat."),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "I BOB. NAZARIY ASOSLAR", bold: true, size: 28, font: 'Times New Roman' })]
          }),
          gostParagraph("Ushbu bobda mavzuga oid asosiy tushunchalar, xalqaro va mahalliy olimlarning ilmiy qarashlari tahlil qilinadi. Ta'lim jarayonida tizimli yondashuvni qo'llash o'quvchilarning bilim saviyasini sezilarli darajada oshirishi ilmiy jihatdan isbotlangan."),
          
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "XULOSA", bold: true, size: 28, font: 'Times New Roman' })]
          }),
          gostParagraph("Olib borilgan tadqiqotlar va o'rganishlar natijasida quyidagi xulosalarga kelindi: zamonaviy texnologiyalardan unumli foydalanish nafaqat vaqtni tejaydi, balki o'quv jarayonining shaffofligi va samaradorligini kafolatlaydi."),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: "FOYDALANILGAN ADABIYOTLAR", bold: true, size: 28, font: 'Times New Roman' })]
          }),
          gostParagraph("1. O'zbekiston Respublikasi Prezidentining ta'lim sohasiga oid qaror va farmonlari.", { firstLine: false }),
          gostParagraph("2. Azizov X. M. Zamonaviy pedagogik texnologiyalar va axborot tizimlari. - Toshkent: O'qituvchi, 2023.", { firstLine: false }),
          gostParagraph("3. Yo'ldoshev J. G., Usmonov S. Ilg'or pedagogik texnologiyalar. - Toshkent, 2021.", { firstLine: false }),
          gostParagraph("4. Rasmiy axborot portallari: https://edu.uz, https://lex.uz", { firstLine: false })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// 5. Rasmiy Maktab Hujjatlari Shablonlari (Ariza, Tushuntirish xati, Bayonnoma, Tavsifnoma)
export async function generateOfficialDocumentDocx(docType, data = {}, filename = "Rasmiy_Hujjat.docx") {
  let docChildren = [];

  if (docType === 'ariza') {
    docChildren = [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 80 },
        children: [new TextRun({ text: `${data.schoolName || '___-sonli umumiy o\'rta ta\'lim maktabi'} direktori`, size: 24, font: 'Times New Roman' })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 120 },
        children: [new TextRun({ text: `${data.directorName || '______________________'} ga`, size: 24, font: 'Times New Roman' })]
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 400 },
        children: [new TextRun({ text: `${data.senderName || 'Fuqaro (Ota-ona) ______________________'} dan`, size: 24, font: 'Times New Roman' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: "ARIZA", bold: true, size: 32, font: 'Times New Roman' })]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 708 },
        spacing: { line: 360, after: 600 },
        children: [
          new TextRun({
            text: data.body || "Mening farzandim ________________________________ni oilaviy sharoitimiz sababli dars mashg'ulotlaridan ___ kunga ozod qilishingizni so'rayman. Farzandimning qoldirilgan darslarini o'z vaqtida o'zlashtirishini ta'minlashni o'z zimmamga olaman.",
            size: 26,
            font: 'Times New Roman'
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 400 },
        children: [
          new TextRun({ text: `Sana: ${data.date || '___.___.2026-yil'}                                            Imzo: ____________`, size: 24, font: 'Times New Roman' })
        ]
      })
    ];
  } else if (docType === 'tavsifnoma') {
    docChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "TAVSIFNOMA", bold: true, size: 32, font: 'Times New Roman' })]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 708 },
        spacing: { line: 360, after: 200 },
        children: [
          new TextRun({
            text: `${data.schoolName || '___-maktab'}ning ${data.grade || '9-A'} sinf o'quvchisi ${data.studentName || '________________________'}ga:`,
            bold: true,
            size: 26,
            font: 'Times New Roman'
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 708 },
        spacing: { line: 360, after: 200 },
        children: [
          new TextRun({
            text: `${data.studentName || 'Mazkur o\'quvchi'} maktabda o'qish davrida o'zini intizomli, namunali xulq-atvorga ega, tirishqoq o'quvchi sifatida namoyon etdi. Darslarga to'liq qatnashadi, fanlarni o'zlashtirish ko'rsatkichi a'lo darajada. O'quvchilar va o'qituvchilar jamoasida hurmat qozongan. Maktabning jamoat ishlarida va fan olimpiadalarida faol ishtirok etib kelmoqda.`,
            size: 26,
            font: 'Times New Roman'
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 708 },
        spacing: { line: 360, after: 400 },
        children: [
          new TextRun({
            text: "Ushbu tavsifnoma talab qilingan joyga taqdim etish uchun berildi.",
            size: 26,
            font: 'Times New Roman'
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 400 },
        children: [
          new TextRun({ text: `Maktab direktori: _______________                     Sinf rahbari: _______________`, size: 24, font: 'Times New Roman' })
        ]
      })
    ];
  } else {
    // Bayonnoma shabloni
    docChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "OTA-ONALAR MAJLISI BAYONNOMASI", bold: true, size: 30, font: 'Times New Roman' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [new TextRun({ text: `Sana: ${data.date || '___.___.2026-yil'}       Joy: ${data.place || 'Maktab majlislar zali'}`, size: 24, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "KUN TARTIBI:", bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        indent: { left: 400 },
        children: [new TextRun({ text: "1. O'quvchilarning choraklik o'zlashtirish natijalari va davomati.", size: 24, font: 'Times New Roman' })]
      }),
      new Paragraph({
        indent: { left: 400 },
        spacing: { after: 200 },
        children: [new TextRun({ text: "2. Maktab formasi va o'quv qurollari bilan ta'minlanganlik holati.", size: 24, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [new TextRun({ text: "QAROR QILINDI:", bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({
        indent: { left: 400 },
        spacing: { after: 400 },
        children: [new TextRun({ text: "Ota-onalar tomonidan o'quvchilarning darsdan tashqari vaqtlarini mazmunli tashkil etish va nazoratni kuchaytirish belgilansin.", size: 24, font: 'Times New Roman' })]
      }),
      new Paragraph({
        spacing: { before: 300 },
        children: [new TextRun({ text: "Majlis raisi: _______________                      Kotib: _______________", size: 24, font: 'Times New Roman' })]
      })
    ];
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } }
      },
      children: docChildren
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

// Yordamchi jadval katakchasi yaratuvchilar (Ministerial Deep Navy & Alternating Rows)
function createHeaderCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "1E3A8A" }, // Deep Navy
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: 20, color: "FFFFFF", font: 'Times New Roman' })]
      })
    ]
  });
}

function createCell(text, width, align = AlignmentType.LEFT, isEven = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: isEven ? { fill: "F8FAFC" } : undefined,
    children: [
      new Paragraph({
        alignment: align,
        children: [new TextRun({ text, size: 20, font: 'Times New Roman' })]
      })
    ]
  });
}


// Ixtiyoriy tahrirlangan matndan professional A4 Word (.docx) yaratish
export async function generateCustomDocumentDocx(text, title = "Tahrirlangan Hujjat", filename = "EduHujjat_Tahrirlangan.docx") {
  const lines = (text || '').split(/\r?\n/);
  const docParagraphs = lines.map(line => {
    const trimmed = line.trim();
    const isHeading = trimmed.startsWith('#') || (trimmed.toUpperCase() === trimmed && trimmed.length > 4 && trimmed.length < 70 && !trimmed.includes('.'));
    const cleanLine = trimmed.replace(/^#+\s*/, '');
    
    return new Paragraph({
      alignment: isHeading ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { before: isHeading ? 160 : 60, after: isHeading ? 120 : 60, line: 276 },
      children: [
        new TextRun({
          text: cleanLine || " ",
          bold: isHeading,
          size: isHeading ? 26 : 24, // 13pt / 12pt
          font: 'Times New Roman'
        })
      ]
    });
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 } } // 2cm / 3cm
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 28,
              font: 'Times New Roman',
              color: "1E3A8A"
            })
          ]
        }),
        ...docParagraphs
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}
