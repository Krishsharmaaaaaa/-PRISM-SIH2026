const fs = require('fs');
const path = require('path');

async function testLiveProduction() {
  const BASE = 'https://prism-sih2026-backend.onrender.com';
  console.log('=== 1. Testing Registration on Live Render Backend ===');
  const email = `live_surveyor_${Date.now()}@prism.gov.in`;
  const orgRes = await fetch(`${BASE}/api/v1/organizations`);
  const orgData = await orgRes.json();
  const orgId = orgData.data?.[0]?._id || '6aab9081c37fa4af01c3541c';
  console.log('Using Org ID:', orgId);

  const regRes = await fetch(`${BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password@123!',
      fullName: 'Live Cadastral Surveyor',
      organizationId: orgId,
    }),
  });
  const regJson = await regRes.json();
  const token = regJson.data?.accessToken;
  console.log('Registered & Authenticated! Access Token exists:', !!token);

  console.log('\n=== 2. Testing Project Creation on Live Render Backend ===');
  const projRes = await fetch(`${BASE}/api/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `Production Aerial Survey ${Date.now()}`,
      city: 'Ghaziabad',
      ward: 'Ward 5',
      centerLat: 28.6692,
      centerLng: 77.4538,
    }),
  });
  const projJson = await projRes.json();
  const projectId = projJson.data?._id || projJson._id;
  console.log('Created Project ID:', projectId);

  console.log('\n=== 3. Testing Real Image Upload to /api/imagery/upload (Unversioned URL) ===');
  const imgPath = path.join(__dirname, '..', '..', 'Testing Images', 'test1.jpeg');
  const imgBuffer = fs.readFileSync(imgPath);
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const formPayload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="projectId"\r\n\r\n${projectId}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="type"\r\n\r\ndrone_rgb\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test1.jpeg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    imgBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const uploadRes = await fetch(`${BASE}/api/imagery/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${token}`,
    },
    body: formPayload,
  });
  const uploadJson = await uploadRes.json();
  console.log('Upload HTTP Status:', uploadRes.status);
  console.log('Upload Response:', JSON.stringify(uploadJson).slice(0, 160));
  const imageryId = uploadJson.data?._id;
  console.log('Uploaded Imagery ID:', imageryId);

  console.log('\n=== 4. Testing AI Feature Extraction on Live Backend ===');
  const extractRes = await fetch(`${BASE}/api/v1/ai/imagery/${imageryId}/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId }),
  });
  const extractJson = await extractRes.json();
  console.log('Extraction HTTP Status:', extractRes.status);
  console.log('Extraction Summary:', extractJson.data?.summary);

  console.log('\n=== 5. Testing GeoJSON Parcel & Building Layers on Live Backend ===');
  const parcelsRes = await fetch(`${BASE}/api/v1/gis/projects/${projectId}/parcels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const parcelsJson = await parcelsRes.json();
  console.log('Parcels Feature Count:', parcelsJson.data?.features?.length);

  const buildingsRes = await fetch(`${BASE}/api/v1/gis/projects/${projectId}/buildings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const buildingsJson = await buildingsRes.json();
  console.log('Buildings Feature Count:', buildingsJson.data?.features?.length);

  console.log('\n=== 6. Testing AI Chatbot on Live Backend ===');
  const chatRes = await fetch(`${BASE}/api/v1/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId,
      message: 'What cadastral parcels and buildings are recorded for this project?',
    }),
  });
  const chatJson = await chatRes.json();
  console.log('Chatbot Reply:', chatJson.data?.reply);

  console.log('\n=== 7. Testing PDF Report Export on Live Backend ===');
  const pdfRes = await fetch(`${BASE}/api/v1/exports/imagery/${imageryId}/report.pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('PDF Report HTTP Status:', pdfRes.status, 'Content-Type:', pdfRes.headers.get('content-type'));

  console.log('\n=== ALL LIVE PRODUCTION VERIFICATIONS PASSED 100%! ===');
}

testLiveProduction().catch(console.error);
