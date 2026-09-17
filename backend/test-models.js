const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-preview',
    'gemini-2.0-flash-lite-001',
    'gemini-flash-lite-latest',
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest'
  ];

  for (const m of models) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent('Return JSON: {"status": "ok"}');
      console.log('Model', m, 'SUCCESS:', result.response.text().slice(0, 100));
    } catch (e) {
      console.log('Model', m, 'FAILED:', e.message.slice(0, 150));
    }
  }
}
test();
