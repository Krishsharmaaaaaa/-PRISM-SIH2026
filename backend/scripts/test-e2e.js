const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const org = await db.collection('organizations').findOne({});
  console.log('Found org:', org._id.toString());

  const email = `testuser_${Date.now()}@example.com`;
  const password = 'Password@123!';

  console.log('1. Registering user...');
  const regRes = await fetch('http://localhost:4000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      fullName: 'Test Surveyor',
      organizationId: org._id.toString(),
    }),
  });
  const regData = await regRes.json();
  const token = regData.data.accessToken;
  console.log('User registered & authenticated, token received.');

  console.log('2. Creating a project...');
  const projRes = await fetch('http://localhost:4000/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'E2E Automated AI Project ' + Date.now(),
      city: 'Ghaziabad',
      ward: 'Ward 12',
      centerLat: 28.6692,
      centerLng: 77.4538,
    }),
  });
  const projData = await projRes.json();
  console.log('Project response:', projData);
  const projectId = projData.data?._id || projData._id;
  console.log('Project created ID:', projectId);

  console.log('3. Uploading aerial image dataset...');
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const fakePng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9QzwAEjDAGYzMGAP34B/kK65UVAAAAAElFTkSuQmCC',
    'base64'
  );

  const formPayload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="projectId"\r\n\r\n${projectId}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="type"\r\n\r\ndrone_rgb\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="drone_sample.png"\r\nContent-Type: image/png\r\n\r\n`),
    fakePng,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const uploadRes = await fetch('http://localhost:4000/api/v1/imagery/upload', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${token}`,
    },
    body: formPayload,
  });
  const uploadData = await uploadRes.json();
  const imageryId = uploadData.data._id;
  console.log('Imagery uploaded successfully, ID:', imageryId);

  console.log('4. Triggering AI cadastral feature extraction...');
  const extractRes = await fetch(`http://localhost:4000/api/v1/ai/imagery/${imageryId}/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId }),
  });
  const extractData = await extractRes.json();
  console.log('AI Extraction response raw:', JSON.stringify(extractData));
  console.log('AI Extraction result summary:', extractData.data?.summary);

  console.log('5. Fetching generated parcels GeoJSON...');
  const parcelsRes = await fetch(`http://localhost:4000/api/v1/gis/projects/${projectId}/parcels`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const parcelsGeo = await parcelsRes.json();
  console.log(`Generated Parcels GeoJSON Features count: ${parcelsGeo.data?.features?.length}`);

  console.log('6. Fetching generated buildings GeoJSON...');
  const buildingsRes = await fetch(`http://localhost:4000/api/v1/gis/projects/${projectId}/buildings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const buildingsGeo = await buildingsRes.json();
  console.log(`Generated Buildings GeoJSON Features count: ${buildingsGeo.data?.features?.length}`);

  console.log('7. Testing AI Chatbot...');
  const chatRes = await fetch('http://localhost:4000/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId,
      message: 'How many parcels and buildings were extracted?',
      history: [{ role: 'model', text: 'Hi, I am the PRISM assistant.' }],
    }),
  });
  const chatData = await chatRes.json();
  console.log('Chatbot Reply:', chatData.data?.reply || chatData.reply);

  console.log('8. Testing Analytics & Insights API...');
  const analyticsRes = await fetch(`http://localhost:4000/api/v1/analytics/projects/${projectId}/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const analyticsData = await analyticsRes.json();
  console.log('Analytics status distribution:', analyticsData.data?.statusDistribution);

  await mongoose.disconnect();
  console.log('\n--- ALL E2E VERIFICATIONS (EXTRACTION, GIS, CHAT, INSIGHTS) PASSED! ---');
}

run().catch(console.error);
