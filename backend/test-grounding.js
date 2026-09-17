const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testGrounding() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const imagePath = path.join(__dirname, 'uploads', '1789642565588-WhatsApp_Image_2026-09-17_at_2.08.27_AM.jpeg');
  const imageBuffer = fs.readFileSync(imagePath);

  const prompt = `You are a state-of-the-art aerial photogrammetry and cadastral GIS segmentation model.
Analyze this aerial image with extreme spatial precision.

Coordinate System:
- Normalized 0 to 1000 grid.
- [x, y] coordinates: x is horizontal distance from left (0) to right (1000). y is vertical distance from top (0) to bottom (1000).

Instructions:
1. DETECT EVERY REAL BUILDING:
   - Identify every actual physical building by tightly outlining its rooftop/eaves.
   - Look specifically for roof surfaces (terracotta/red/orange tiles, flat roofs, gables, zinc roofs).
   - Trace the exact multi-point polygonal boundary [[x, y], ...] around each individual building rooftop.
   - DO NOT mark roads, parking lanes, asphalt, pedestrian crossings, or trees as buildings!

2. DETECT ALL ROADS & STREETS:
   - Trace the polyline path [[x, y], ...] along the center of all asphalt roads, avenues, streets, roundabouts, and alleys.
   - Provide realistic road width in meters (e.g., 6.0 to 18.0 meters).

3. DETECT CADASTRAL PROPERTY PARCELS:
   - Divide the mapped land into cadastral parcel polygons [[x, y], ...] wrapping around the buildings and bounded by road corridors.

4. Respond with valid JSON matching this schema:
{
  "buildings": [
    {
      "polygon": [[x, y], [x, y], ...],
      "category": "residential" | "commercial" | "industrial" | "institutional" | "mixed_use",
      "confidence": 0.95
    }
  ],
  "roads": [
    {
      "path": [[x, y], [x, y], ...],
      "category": "main_road" | "lane" | "pathway" | "access_corridor",
      "estimatedWidthM": 10.0,
      "confidence": 0.95
    }
  ],
  "landUseZones": [
    {
      "polygon": [[x, y], [x, y], ...],
      "landUse": "residential" | "commercial" | "mixed_use" | "open_space",
      "confidence": 0.95
    }
  ],
  "notes": "Description of the detected structures, roofs, and road layout."
}`;

  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-lite-latest',
    generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
  });

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { data: imageBuffer.toString('base64'), mimeType: 'image/jpeg' } },
  ]);

  const text = result.response.text();
  console.log('Result from gemini-flash-lite-latest:');
  const parsed = JSON.parse(text);
  console.log('Buildings:', JSON.stringify(parsed.buildings, null, 2));
  console.log('Roads:', JSON.stringify(parsed.roads, null, 2));
}

testGrounding().catch(console.error);
