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

    if (type === 'test') {
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
      result = await generateAIGammaCardsWithGemini(prompt);
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
