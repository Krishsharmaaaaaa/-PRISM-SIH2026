const turf = require('@turf/turf');

function normalizedRingToGeoJSON(ring, bbox) {
  const [wLng, sLat] = bbox.southWest;
  const [eLng, nLat] = bbox.northEast;
  return ring.map(([nx, ny]) => [
    wLng + (nx / 1000) * (eLng - wLng),
    nLat - (ny / 1000) * (nLat - sLat),
  ]);
}

const bbox = {
  northEast: [77.4563, 28.6712],
  southWest: [77.4513, 28.6672],
};

const buildingPoly = [[780,195],[985,195],[985,345],[810,345],[810,485],[780,485],[780,195]];
const geoRing = normalizedRingToGeoJSON(buildingPoly, bbox);
console.log('GeoRing:', geoRing);

try {
  const fp = turf.polygon([geoRing]);
  console.log('Footprint area:', turf.area(fp));
  const candidate = turf.buffer(fp, 2.5, { units: 'meters' });
  console.log('Buffer candidate:', candidate);
  const roadPath = [[465, 0], [465, 1000]];
  const roadGeo = normalizedRingToGeoJSON(roadPath, bbox);
  const roadLine = turf.lineString(roadGeo);
  const roadBuf = turf.buffer(roadLine, 1.5, { units: 'meters' });
  console.log('RoadBuf:', roadBuf);

  // Test difference:
  try {
    const diff1 = turf.difference(candidate, roadBuf);
    console.log('Diff 1:', diff1);
  } catch (e) {
    console.log('Diff 1 error:', e.message);
  }
  try {
    const diff2 = turf.difference(turf.featureCollection([candidate, roadBuf]));
    console.log('Diff 2:', diff2);
  } catch (e) {
    console.log('Diff 2 error:', e.message);
  }
} catch (e) {
  console.error('Error:', e);
}
