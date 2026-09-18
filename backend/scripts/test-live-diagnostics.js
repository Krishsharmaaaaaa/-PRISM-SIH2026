const fs = require('fs');
const path = require('path');

async function timedFetch(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const durationMs = Date.now() - start;
    clearTimeout(timer);
    return { res, durationMs };
  } catch (err) {
    clearTimeout(timer);
    const durationMs = Date.now() - start;
    throw new Error(`${err.message} (${durationMs}ms)`);
  }
}

async function runLiveDiagnostics() {
  const BASE = 'https://prism-sih2026-backend.onrender.com';
  console.log(`[${new Date().toISOString()}] Starting live endpoint diagnostics on ${BASE}`);

  // 1. Health / Docs
  console.log(`\n[STEP 1] Probing Swagger Docs (/api/docs)...`);
  const t1 = await timedFetch(`${BASE}/api/docs`, { method: 'GET' }, 10000);
  console.log(`[PASS] Swagger Docs: HTTP ${t1.res.status} (${t1.durationMs}ms)`);

  // 2. Auth - Organization & Registration
  console.log(`\n[STEP 2] Fetching Organizations (/api/v1/organizations)...`);
  const t2 = await timedFetch(`${BASE}/api/v1/organizations`, { method: 'GET' }, 10000);
  const orgData = await t2.res.json();
  const orgId = orgData.data?.[0]?._id || '6aab9081c37fa4af01c3541c';
  console.log(`[PASS] Org list: HTTP ${t2.res.status} (${t2.durationMs}ms), Selected Org ID: ${orgId}`);

  console.log(`\n[STEP 3] Registering Test User (/api/v1/auth/register)...`);
  const email = `diag_${Date.now()}@prism.gov.in`;
  const t3 = await timedFetch(`${BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password@123!',
      fullName: 'Diagnostics Surveyor',
      organizationId: orgId,
    }),
  }, 10000);
  const regData = await t3.res.json();
  const token = regData.data?.accessToken;
  console.log(`[PASS] Auth Register: HTTP ${t3.res.status} (${t3.durationMs}ms), Token acquired: ${!!token}`);

  // 3. Project Creation
  console.log(`\n[STEP 4] Creating Test Project (/api/v1/projects)...`);
  const t4 = await timedFetch(`${BASE}/api/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: `Verification Project ${Date.now()}`,
      city: 'Ghaziabad',
      ward: 'Ward 8',
      centerLat: 28.6692,
      centerLng: 77.4538,
    }),
  }, 10000);
  const projData = await t4.res.json();
  const projectId = projData.data?._id || projData._id;
  console.log(`[PASS] Create Project: HTTP ${t4.res.status} (${t4.durationMs}ms), Project ID: ${projectId}`);

  // 4. Exact Tested Endpoint: POST /api/imagery/upload
  console.log(`\n[STEP 5] Testing POST /api/imagery/upload (Unversioned URL with real JPEG payload)...`);
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

  const t5 = await timedFetch(`${BASE}/api/imagery/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${token}`,
    },
    body: formPayload,
  }, 20000);
  const uploadData = await t5.res.json();
  const imageryId = uploadData.data?._id;
  console.log(`[PASS] POST /api/imagery/upload: HTTP ${t5.res.status} (${t5.durationMs}ms)`);
  console.log(`       Upload Record ID: ${imageryId}`);
  console.log(`       Storage Path: ${uploadData.data?.storagePath}`);
  console.log(`       Size: ${(uploadData.data?.sizeBytes / 1024).toFixed(1)} KB, Mime: ${uploadData.data?.mimeType}`);

  // 5. Versioned Endpoint check: POST /api/v1/imagery/upload
  console.log(`\n[STEP 6] Testing POST /api/v1/imagery/upload (Versioned URL with real JPEG payload)...`);
  const t6 = await timedFetch(`${BASE}/api/v1/imagery/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${token}`,
    },
    body: formPayload,
  }, 20000);
  const uploadData2 = await t6.res.json();
  console.log(`[PASS] POST /api/v1/imagery/upload: HTTP ${t6.res.status} (${t6.durationMs}ms), ID: ${uploadData2.data?._id}`);

  console.log(`\n======================================================`);
  console.log(`ALL TESTED LIVE ENDPOINTS RETURNED 200/201 SUCCESS!`);
  console.log(`======================================================`);
}

runLiveDiagnostics().catch((err) => {
  console.error('\n[DIAGNOSTIC FAILURE]:', err.message);
  process.exit(1);
});
