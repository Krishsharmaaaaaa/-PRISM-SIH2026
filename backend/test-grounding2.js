const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testGrounding2() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const imagePath = path.join(__dirname, 'uploads', '1789642565588-WhatsApp_Image_2026-09-17_at_2.08.27_AM.jpeg');
  const imageBuffer = fs.readFileSync(imagePath);

  const prompt = `You are a high-precision GIS and photogrammetry vision analyst.
Examine this aerial/drone photograph and detect the exact locations of:
1. All building rooftops (orange/red clay tiles, flat roofs, corrugated metal roofs).
2. The road network (asphalt roads, intersections, roundabout, lanes).
3. Land parcels / plots.

Return the detection coordinates using normalized coordinates (0 to 1000):
For each building:
- Provide the exact bounding box \`[ymin, xmin, ymax, xmax]\` where:
  - ymin = top edge (0-1000)
  - xmin = left edge (0-1000)
  - ymax = bottom edge (0-1000)
  - xmax = right edge (0-1000)
- Also provide the precise polygon perimeter \`polygon\`: \`[[x1, y1], [x2, y2], ...]\` tracing the building roof corners from top-left clockwise where x is horizontal [0-1000] and y is vertical [0-1000].
- Category: "residential", "commercial", "industrial", "institutional", "mixed_use".

For each road:
- \`path\`: polyline points \`[[x1, y1], [x2, y2], ...]\` along the center of the road.
- \`estimatedWidthM\`: width in meters (e.g. 8.0 to 20.0).
- Category: "main_road", "lane", "roundabout", "access_corridor".

For each parcel:
- \`polygon\`: property boundary polygon \`[[x1, y1], [x2, y2], ...]\`.
- \`landUse\`: "residential", "commercial", "mixed_use", "open_space".

Respond in JSON format:
{
  "buildings": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "polygon": [[x, y], ...],
      "category": "residential",
      "confidence": 0.95
    }
  ],
  "roads": [
    {
      "path": [[x, y], ...],
      "category": "main_road",
      "estimatedWidthM": 12.0,
      "confidence": 0.96
    }
  ],
  "landUseZones": [
    {
      "polygon": [[x, y], ...],
      "landUse": "residential",
      "confidence": 0.94
    }
  ],
  "notes": "..."
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
  console.log('Result from gemini-flash-lite-latest with box_2d:');
  const parsed = JSON.parse(text);
  console.log('Buildings:', JSON.stringify(parsed.buildings, null, 2));
  console.log('Roads:', JSON.stringify(parsed.roads, null, 2));
}

testGrounding2().catch(console.error);
