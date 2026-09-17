const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

function normalizeFeaturePolygon(feature) {
  // If box_2d is present: [ymin, xmin, ymax, xmax]
  let points = [];
  if (feature.box_2d && Array.isArray(feature.box_2d) && feature.box_2d.length === 4) {
    const [ymin, xmin, ymax, xmax] = feature.box_2d.map(Number);
    // If polygon is given, let's check its orientation
    if (feature.polygon && Array.isArray(feature.polygon) && feature.polygon.length >= 3) {
      // Check if polygon points are [y, x] or [x, y]
      const raw = feature.polygon;
      // In [ymin, xmin, ymax, xmax], Y ranges in [ymin, ymax] and X ranges in [xmin, xmax]
      // Sample first point:
      const p0 = raw[0];
      const p0_0 = Number(p0[0]);
      const p0_1 = Number(p0[1]);
      
      // If p0_0 is close to ymin/ymax and p0_1 is close to xmin/xmax, it's [y, x]
      const distAsYX = Math.abs(p0_0 - ymin) + Math.abs(p0_1 - xmin);
      const distAsXY = Math.abs(p0_0 - xmin) + Math.abs(p0_1 - ymin);
      
      if (distAsYX < distAsXY) {
        // Points are [y, x], swap to [x, y]
        points = raw.map(p => [Math.round(Number(p[1])), Math.round(Number(p[0]))]);
      } else {
        // Points are already [x, y]
        points = raw.map(p => [Math.round(Number(p[0])), Math.round(Number(p[1]))]);
      }
    } else {
      // Create rectangle polygon from box_2d: [xmin, ymin] -> [xmax, ymin] -> [xmax, ymax] -> [xmin, ymax] -> [xmin, ymin]
      points = [
        [xmin, ymin],
        [xmax, ymin],
        [xmax, ymax],
        [xmin, ymax],
        [xmin, ymin],
      ];
    }
  } else if (feature.polygon && Array.isArray(feature.polygon)) {
    points = feature.polygon.map(p => [Math.round(Number(p[0])), Math.round(Number(p[1]))]);
  }

  // Ensure closed ring
  if (points.length >= 3) {
    const first = points[0];
    const last = points[points.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      points.push([first[0], first[1]]);
    }
  }
  return points;
}

function normalizeFeaturePath(rawPath) {
  if (!rawPath || !Array.isArray(rawPath)) return [];
  return rawPath.map(p => [Math.round(Number(p[0])), Math.round(Number(p[1]))]);
}

async function testExtraction() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const imagePath = path.join(__dirname, 'uploads', '1789642565588-WhatsApp_Image_2026-09-17_at_2.08.27_AM.jpeg');
  const imageBuffer = fs.readFileSync(imagePath);

  const prompt = `You are an expert Cadastral GIS & Photogrammetry Vision Analyst reviewing an aerial drone orthomosaic for an official municipal land registry.
Study the provided aerial photo with extreme spatial precision and extract all physical structures and boundaries:

COORDINATE INSTRUCTIONS:
- Coordinate grid is 0 to 1000.
- 0,0 is top-left, 1000,1000 is bottom-right.
- For bounding boxes, return "box_2d": [ymin, xmin, ymax, xmax] where:
  * ymin is distance from top edge (0 to 1000)
  * xmin is distance from left edge (0 to 1000)
  * ymax is distance to bottom edge (0 to 1000)
  * xmax is distance to right edge (0 to 1000)
- For building polygons, return closed perimeter coordinates [[x, y], ...] around the roof edges.

CRITICAL FEATURE IDENTIFICATION RULES:
1. BUILDINGS:
   - Identify EVERY distinct building structure and roof complex in the scene.
   - Look closely for terracotta/red clay tile roofs, brown shingle roofs, corrugated zinc/tin roofs, and concrete roofs.
   - Trace each building block or rooftop tightly.
   - Do NOT label roads, roundabouts, cars, asphalt parking, or tree canopies as buildings!

2. ROADS & STREETS:
   - Identify asphalt roads, avenues, intersecting lanes, alleys, and roundabouts.
   - Trace path [[x, y], ...] along the road centerlines.
   - Set estimatedWidthM (e.g. 7.0 to 16.0 meters).

3. CADASTRAL PARCELS:
   - Cadastral plot polygons [[x, y], ...] enclosing individual properties.

Respond with strict JSON:
{
  "buildings": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "polygon": [[x, y], ...],
      "category": "residential" | "commercial" | "industrial" | "mixed_use",
      "confidence": 0.95
    }
  ],
  "roads": [
    {
      "path": [[x, y], ...],
      "category": "main_road" | "lane" | "access_corridor",
      "estimatedWidthM": 10.0,
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
  "notes": "Concise summary of identified urban structures and road layout."
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
  const parsed = JSON.parse(text);
  
  console.log(`Extracted ${parsed.buildings?.length} buildings, ${parsed.roads?.length} roads.`);
  
  const normalizedBuildings = (parsed.buildings || []).map(b => ({
    category: b.category,
    confidence: b.confidence,
    polygon: normalizeFeaturePolygon(b),
    box_2d: b.box_2d,
  }));

  console.log('\nNormalized buildings:');
  normalizedBuildings.forEach((b, i) => {
    console.log(`Building #${i + 1} (${b.category}): ${JSON.stringify(b.polygon)}`);
  });
}

testExtraction().catch(console.error);
