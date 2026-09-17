const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('API Key present:', !!apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);

  const imagePath = path.join(__dirname, 'uploads', '1789642565588-WhatsApp_Image_2026-09-17_at_2.08.27_AM.jpeg');
  if (!fs.existsSync(imagePath)) {
    console.log('File not found:', imagePath);
    return;
  }
  const imageBuffer = fs.readFileSync(imagePath);
  console.log('Image buffer size:', imageBuffer.length);

  const prompt = `You are an expert Cadastral GIS & Photogrammetry Vision Analyst reviewing an aerial drone orthomosaic for an official municipal land registry.
Study the image with extreme precision and extract:
1. Exact perimeter polygons circumscribing EVERY building rooftop/facade. CRITICAL: Trace the true architectural perimeter with 4 to 16 vertices capturing all wings, setbacks, L-shapes, T-shapes, angled roof gables, and courtyards.
2. Road network centerlines and corridors covering all primary avenues, streets, access lanes, and pathways with realistic estimated widths in meters.
3. Cadastral parcel plots dividing property boundaries cleanly, buffered around buildings and bounded by road corridors.
4. Land use zoning (residential, commercial, industrial, mixed_use, open_space, vegetation).

Work on a normalized 0-1000 by 0-1000 coordinate grid (0,0 = top-left, 1000,1000 = bottom-right).
Every polygon must be closed (first and last vertex identical) with 4 to 16 distinct perimeter vertices.
Every road path must have 2 to 12 polyline nodes.

Respond ONLY with strict JSON:
{
  "buildings": [
    { "polygon": [[x,y], ...], "category": "residential|commercial|industrial|institutional|unknown", "confidence": 0.0-1.0 }
  ],
  "roads": [
    { "path": [[x,y], ...], "category": "main_road|lane|pathway|access_corridor", "confidence": 0.0-1.0, "estimatedWidthM": number }
  ],
  "landUseZones": [
    { "polygon": [[x,y], ...], "landUse": "residential|commercial|industrial|mixed_use|vacant|public_utility|open_space", "confidence": 0.0-1.0 }
  ],
  "notes": "Concise summary of detected cadastral structures and parcel layout."
}`;

  const candidateModels = [
    'gemini-flash-lite-latest',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-flash-latest',
    'gemini-3.6-flash',
  ];

  for (const modelName of candidateModels) {
    console.log(`\nTesting model: ${modelName}`);
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      });
      const result = await model.generateContent([
        { text: prompt },
        { inlineData: { data: imageBuffer.toString('base64'), mimeType: 'image/jpeg' } },
      ]);
      const text = result.response.text();
      console.log(`SUCCESS with ${modelName}! Length: ${text.length}`);
      console.log('Sample parsed:');
      const parsed = JSON.parse(text);
      console.log(`Buildings count: ${parsed.buildings?.length}`);
      console.log(`Roads count: ${parsed.roads?.length}`);
      console.log(`Parcels count: ${parsed.landUseZones?.length}`);
      console.log('Sample building 1:', JSON.stringify(parsed.buildings?.[0]));
      console.log('Sample road 1:', JSON.stringify(parsed.roads?.[0]));
      break;
    } catch (e) {
      console.log(`FAILED with ${modelName}:`, e.message);
    }
  }
}

test();
