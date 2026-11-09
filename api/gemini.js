// Vercel Serverless Function: api/gemini.js
import { 
  callGemini, 
  generateAITestWithGemini, 
  generateAILessonPlanWithGemini, 
  generateAIOfficialOrderWithGemini, 
  generateAIProtocolWithGemini, 
  generateAIStudentReferenceWithGemini, 
  generateAIGammaCardsWithGemini 
} from '../src/utils/geminiAiService.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, prompt, count } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt talab qilinadi' });
    }

    let result = '';

    if (type === 'cleaner_parse') {
      const systemInstruction = 
        "Siz o'quvchilar va shaxslar ro'yxatini tahlil qiluvchi professional AI tizimsiz. " +
        "Berilgan tartibsiz matndan har bir shaxsning ma'lumotlarini aniq ajrating va FAQAT quyidagi toza JSON massiv formatida javob bering:\n" +
        "[{\n" +
        '  "fullName": "Familiya Ism Sharif (faqat shaxsning ismi va familiyasi, ortiqcha manzil yoki jins so\'zlari bo\'lmasin)",\n' +
        '  "birthDate": "YYYY.MM.DD yoki DD.MM.YYYY yoki -",\n' +
        '  "age": 13,\n' +
        '  "ageText": "13 yosh",\n' +
        '  "grade": "9-B yoki 10-A yoki -",\n' +
        '  "phone": "+998... yoki -",\n' +
        '  "address": "Tuman, mavze, ko\'cha, uy yoki -",\n' +
        '  "gender": "male" yoki "female"\n' +
        "}]\n" +
        "Qat'iy qoida: Hech qanday markdown (```json) yoki izoh qo'shmang, faqat to'g'ridan-to'g'ri haqiqiy parse qilinadigan JSON bering!";
      result = await callGemini(prompt, systemInstruction);
    } else if (type === 'document_transform') {
      const { instruction, documentText } = req.body || {};
      const systemInstruction =
        "Siz O'zbekiston Respublikasining eng yuqori toifali huquqiy, pedagogik va tahririyat bo'yicha bosh tahrirchisi va hujjatlar ekspertisiz. " +
        "Foydalanuvchi taqdim etgan hujjat yoki jadval matniga uning aniq buyrug'i bo'yicha o'zgartirishlar kiriting: " +
        "keraksiz bandlarni o'chiring, xatolarni to'g'irlang, yangi qismlarni qo'shing va uslubiy jihatdan mukammal qilib qayta yozing. " +
        "Javobni quyidagi JSON formatida qaytaring:\n" +
        "{\n" +
        '  "transformedText": "Tahrirlangan to\'liq yangi hujjat matni",\n' +
        '  "changelog": [\n' +
        '    "1. 2024-yilgi eski qonun bandi o\'chirildi",\n' +
        '    "2. 3 ta grammatik xato to\'g\'rilandi",\n' +
        '    "3. Yangi mas\'ul shaxs kiritildi"\n' +
        '  ],\n' +
        '  "summary": "Qilingan o\'zgarishlar haqida qisqacha xulosa"\n' +
        "}\n" +
        "Faqat toza JSON formatida javob bering!";
      result = await callGemini(`Hujjat matni:\n"""\n${documentText || prompt}\n"""\n\nFoydalanuvchi buyrug'i:\n"""\n${instruction || "Hujjatdagi barcha xatolarni to'g'irla va rasmiy uslubga sol"}\n"""`, systemInstruction);
    } else if (type === 'test') {
      result = await generateAITestWithGemini(prompt, count || 10);
    } else if (type === 'lesson') {
      result = await generateAILessonPlanWithGemini(prompt);
    } else if (type === 'order') {
      result = await generateAIOfficialOrderWithGemini(prompt);
    } else if (type === 'protocol') {
      result = await generateAIProtocolWithGemini(prompt);
    } else if (type === 'reference') {
      result = await generateAIStudentReferenceWithGemini(prompt);
    } else if (type === 'cards') {
      const { count, authorName, includeImages, imageStyle, imageDensity, detailLevel } = req.body || {};
      result = await generateAIGammaCardsWithGemini(prompt, {
        slideCount: count,
        authorName,
        includeImages,
        imageStyle,
        imageDensity,
        detailLevel
      });
    } else {
      result = await callGemini(
        prompt,
        "Siz O'zbekiston Respublikasi Maktabgacha va Maktab Ta'limi Vazirligi mezonlari bo'yicha eng yuqori toifali pedagogik ekspert va metodistsiz. Har qanday ta'limiy, metodik savollarga to'liq, ilmiy va tushunarli o'zbek tilida javob bering."
      );
    }

    return res.status(200).json({ success: true, result });
  } catch(err) {
    console.error('API Gemini error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
