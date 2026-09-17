const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testExtractionAccurate() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const imagePath = path.join(__dirname, 'uploads', '1789642565588-WhatsApp_Image_2026-09-17_at_2.08.27_AM.jpeg');
  const imageBuffer = fs.readFileSync(imagePath);

  const prompt = `You are a high-precision Photogrammetry & Cadastral GIS Engine.
Carefully inspect this drone aerial photograph.

TASK: Detect all physical structures and infrastructure with accurate spatial coordinates.

Coordinate format:
- All coordinates are normalized integers from 0 to 1000.
- For bounding boxes, use Google standard [ymin, xmin, ymax, xmax] where:
  - ymin: top boundary (0 = top of image, 1000 = bottom)
  - xmin: left boundary (0 = left of image, 1000 = right)
  - ymax: bottom boundary
  - xmax: right boundary
- For polygons, provide a closed ring of [x, y] vertex coordinates where x is horizontal (0..1000 from left to right) and y is vertical (0..1000 from top to bottom).

1. BUILDINGS:
   - Identify every distinct building / rooftop (red/orange clay tiles, dark roofs, flat roofs).
   - Tightly trace the roofline polygon [x, y] corners.
   - Do NOT classify asphalt road, pedestrian crossings, or tree canopies as buildings.

2. ROADS:
   - Identify every road, street, avenue, lane, and roundabout.
   - Trace the center path [x, y] coordinates along the road centerline.
   - Estimate the road width in meters (e.g. 6 to 18 meters).

3. PARCELS:
   - Property boundary polygons [x, y] bounded by road corridors.

Return ONLY JSON:
{
  "buildings": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "polygon": [[x, y], [x, y], ...],
      "category": "residential" | "commercial" | "industrial" | "mixed_use",
      "confidence": 0.95
    }
  ],
  "roads": [
    {
      "path": [[x, y], ...],
      "category": "main_road" | "lane" | "access_corridor",
      "estimatedWidthM": number,
      "confidence": 0.95
    }
  ],
  "landUseZones": [
    {
      "polygon": [[x, y], ...],
      "landUse": "residential" | "commercial" | "mixed_use" | "open_space",
      "confidence": 0.95
    }
  ],
  "notes": "string"
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
  console.log('Result:');
  const parsed = JSON.parse(text);
  console.log('Buildings count:', parsed.buildings?.length);
  for (const b of parsed.buildings || []) {
    console.log(`Building (${b.category}): box_2d=${JSON.stringify(b.box_2d)}, poly_pts=${b.polygon?.length}`);
    console.log(`  polygon sample:`, JSON.stringify(b.polygon));
  }
  console.log('Roads count:', parsed.roads?.length);
  for (const r of parsed.roads || []) {
    console.log(`Road (${r.category}, ${r.estimatedWidthM}m): path_pts=${r.path?.length}, path=${JSON.stringify(r.path)}`);
  }
}

testExtractionAccurate().catch(console.error);
