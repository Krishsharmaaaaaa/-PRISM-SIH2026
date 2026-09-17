const mongoose = require('mongoose');
require('dotenv').config();

async function listUsers() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log('Users in DB:');
  users.forEach(u => console.log(`- ${u.email} (role: ${u.role})`));
  await mongoose.disconnect();
}

listUsers().catch(console.error);
