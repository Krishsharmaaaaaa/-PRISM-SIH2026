async function testChat() {
  const loginRes = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'technicalkunal30@gmail.com', password: 'Admin@123456' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken || loginData.accessToken;

  // Get project list
  const projRes = await fetch('http://localhost:4000/api/v1/projects', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projData = await projRes.json();
  const projects = projData.data || [];
  if (projects.length === 0) {
    console.log('No projects found to test chat.');
    return;
  }
  const projectId = projects[0]._id;
  console.log('Testing chat on project:', projectId);

  const chatRes = await fetch('http://localhost:4000/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId,
      message: 'How many parcels and buildings are detected in this project?',
      history: [
        { role: 'model', text: "Hi, I'm the PRISM assistant." }
      ],
    }),
  });
  const chatData = await chatRes.json();
  console.log('Chat response:', chatData);

  const reportRes = await fetch(`http://localhost:4000/api/v1/ai/projects/${projectId}/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const reportData = await reportRes.json();
  console.log('Report response:', reportData);
}

testChat().catch(console.error);
