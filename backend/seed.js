require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create admin
  const existing = await User.findOne({ email: 'admin@society.com' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
  } else {
    const admin = await User.create({
      name: 'Society Admin',
      email: 'admin@society.com',
      password: 'admin1234',
      role: 'admin',
    });
    console.log('Admin created:', admin.email, '/ password: admin1234');
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch(e => { console.error(e); process.exit(1); });
