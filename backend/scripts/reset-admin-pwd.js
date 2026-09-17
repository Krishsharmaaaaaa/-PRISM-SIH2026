const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  const hash = await bcrypt.hash('Admin@123456', 10);
  await db.collection('users').updateMany(
    { email: 'technicalkunal30@gmail.com' },
    { $set: { passwordHash: hash, role: 'admin' } }
  );

  // Also ensure an admin user admin@prism.gov.in exists with known password
  const existingPrism = await db.collection('users').findOne({ email: 'admin@prism.gov.in' });
  const org = await db.collection('organizations').findOne({});
  
  if (!existingPrism) {
    await db.collection('users').insertOne({
      email: 'admin@prism.gov.in',
      passwordHash: hash,
      fullName: 'System Administrator',
      role: 'admin',
      organization: org?._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Created admin@prism.gov.in user.');
  } else {
    await db.collection('users').updateOne(
      { email: 'admin@prism.gov.in' },
      { $set: { passwordHash: hash, role: 'admin' } }
    );
    console.log('Updated admin@prism.gov.in password.');
  }

  console.log('Admin password set to Admin@123456');
  await mongoose.disconnect();
}

reset().catch(console.error);
