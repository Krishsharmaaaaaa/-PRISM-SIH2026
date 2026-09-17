const fs = require('fs');
const path = require('path');

async function testFullPipeline() {
  const imagePath = path.join(__dirname, 'uploads', '1789642565588-WhatsApp_Image_2026-09-17_at_2.08.27_AM.jpeg');
  if (!fs.existsSync(imagePath)) {
    console.log('Image not found:', imagePath);
    return;
  }

  const formData = new FormData();
  const fileBlob = new Blob([fs.readFileSync(imagePath)], { type: 'image/jpeg' });
  formData.append('file', fileBlob, 'test-aerial-ortho.jpg');
  formData.append('projectId', '6aabb5f492fa58e7033199dc');
  formData.append('type', 'drone_rgb');

  console.log('1. Uploading image to backend...');
  const uploadRes = await fetch('http://localhost:4000/api/v1/imagery/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadJson = await uploadRes.json();
  console.log('Upload response:', uploadJson);

  const imageryId = uploadJson.data?._id || uploadJson._id;
  if (!imageryId) {
    console.error('Failed to get imageryId');
    return;
  }

  console.log(`2. Running AI extraction for imageryId ${imageryId}...`);
  const extractRes = await fetch(`http://localhost:4000/api/v1/ai/imagery/${imageryId}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: '6aabb5f492fa58e7033199dc' }),
  });

  const extractJson = await extractRes.json();
  const data = extractJson.data || extractJson;
  console.log('3. Extraction Result Status:', extractRes.status);
  console.log('Extraction Summary:', data.summary);
  console.log('Extracted Buildings Count:', data.buildings?.length);
  console.log('Extracted Roads Count:', data.roads?.length);
  console.log('Extracted Parcels Count:', data.parcels?.length);
  console.log('Raw detections buildings count:', data.rawDetections?.buildings?.length);
  console.log('Sample raw building 1:', JSON.stringify(data.rawDetections?.buildings?.[0]));
  console.log('Sample raw road 1:', JSON.stringify(data.rawDetections?.roads?.[0]));
}

testFullPipeline().catch(console.error);
