import * as turf from '@turf/turf';

/**
 * Converts coordinates from Gemini's normalized 0-1000 image grid into real WGS84
 * [lng, lat] pairs using the image's known geographic bounding box (north-east / south-west
 * corners, supplied at upload time from drone flight-planning or GNSS/CORS survey data).
 */
export interface BBox {
  northEast: number[]; // [lng, lat]
  southWest: number[]; // [lng, lat]
}

export function normalizedToLngLat([x, y]: number[], bbox: BBox): number[] {
  const [neLng, neLat] = bbox.northEast;
  const [swLng, swLat] = bbox.southWest;

  const fracX = Math.min(Math.max(x / 1000, 0), 1);
  const fracY = Math.min(Math.max(y / 1000, 0), 1);

  const lng = swLng + fracX * (neLng - swLng);
  // y=0 is the top of the image (north), y=1000 is the bottom (south)
  const lat = neLat - fracY * (neLat - swLat);

  return [Number(lng.toFixed(8)), Number(lat.toFixed(8))];
}

export function cleanGeoJSONPolygonRing(ring: number[][]): number[][] {
  if (!ring || ring.length < 4) return ring;
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
    ring = [...ring, ring[0]];
  }
  try {
    const poly = turf.polygon([ring]);
    const kinks = turf.kinks(poly);
    if (kinks.features && kinks.features.length > 0) {
      const unkinked = turf.unkinkPolygon(poly);
      if (unkinked.features && unkinked.features.length > 0 && unkinked.features[0].geometry.type === 'Polygon') {
        return unkinked.features[0].geometry.coordinates[0];
      }
      const hull = turf.convex(poly);
      if (hull && hull.geometry.type === 'Polygon') {
        return hull.geometry.coordinates[0];
      }
    }
  } catch {
    try {
      const hull = turf.convex(turf.featureCollection(ring.map((pt) => turf.point(pt))));
      if (hull && hull.geometry.type === 'Polygon') {
        return hull.geometry.coordinates[0];
      }
    } catch {}
  }
  return ring;
}

export function normalizedRingToGeoJSON(points: number[][], bbox: BBox): number[][] {
  const ring = points.map((p) => normalizedToLngLat(p, bbox));
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (!first || !last) return ring;
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push(first);
  return cleanGeoJSONPolygonRing(ring);
}

export function normalizedPathToGeoJSON(points: number[][], bbox: BBox): number[][] {
  return points.map((p) => normalizedToLngLat(p, bbox));
}

