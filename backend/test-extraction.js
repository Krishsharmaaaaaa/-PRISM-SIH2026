const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testImageExtraction() {
  const uploads = fs.readdirSync('./uploads').filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
  if (uploads.length === 0) {
    console.log('No images in uploads directory');
    return;
  }
  const imgPath = path.join('./uploads', uploads[0]);
  console.log('Testing image:', imgPath);
  const imgBuffer = fs.readFileSync(imgPath);

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
  });

  const prompt = `
You are an expert Cadastral GIS & Photogrammetry Vision Analyst reviewing an aerial drone orthomosaic.
Analyze the uploaded image with extreme precision and extract:
1. Real architectural perimeter polygons circumscribing building footprints (6-16 vertices per polygon, non-rectangular L-shapes/wings).
2. Road network centerlines with estimated widths.
3. Cadastral parcel deed boundaries.
4. Land use zoning.

Work on normalized 0-1000 grid. Every polygon must be closed (first and last vertex identical).

Return strict JSON:
{
  "buildings": [
    { "polygon": [[x,y], ...], "category": "residential|commercial|industrial", "confidence": 0.95 }
  ],
  "roads": [
    { "path": [[x,y], ...], "category": "main_road|lane|pathway", "confidence": 0.95, "estimatedWidthM": 8 }
  ],
  "landUseZones": [
    { "polygon": [[x,y], ...], "landUse": "residential|commercial|open_space", "confidence": 0.95 }
  ],
  "notes": "Detailed analysis summary of the specific features in this image."
}
`;

  try {
    const res = await model.generateContent([
      { text: prompt },
      { inlineData: { data: imgBuffer.toString('base64'), mimeType: 'image/jpeg' } }
    ]);
    const text = res.response.text();
    console.log('EXTRACTION SUCCESS! Result length:', text.length);
    console.log('Preview:', text.slice(0, 400));
  } catch (err) {
    console.error('Extraction failed:', err.message);
  }
}

testImageExtraction();
