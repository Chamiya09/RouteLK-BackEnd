const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

/**
 * Creates or resets the fixed default admin account
 */
const createFixedAdmin = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      'mongodb+srv://Routelk:12345@dinusara.l0zotk5.mongodb.net/?appName=Dinusara';

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    const adminEmail = 'admin@routelk.lk';
    const adminPassword = 'admin123';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Admin account '${adminEmail}' already exists.`);
      // Reset password and role to guarantee it works
      admin.password = adminPassword;
      admin.role = 'admin';
      admin.name = 'System Admin';
      admin.phone = '0771112233';
      await admin.save();
      console.log(`Password reset to '${adminPassword}' and role set to 'admin'.`);
    } else {
      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '0771112233',
        role: 'admin',
      });
      console.log(`Fixed admin account successfully created.`);
    }

    console.log('\n========================================');
    console.log('   FIXED ADMIN CREDENTIALS');
    console.log('========================================');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role:     ${admin.role}`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`Error creating fixed admin: ${error.message}`);
    process.exit(1);
  }
};

createFixedAdmin();
