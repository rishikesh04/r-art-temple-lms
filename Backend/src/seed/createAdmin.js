import dotenv from 'dotenv';
import User from '../models/user.model.js';
import connectDB from '../db/db.js';

// Load environment variables (assumes script is run from the root folder where .env is located)
dotenv.config();

const createAdmin = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Check if an admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });

    // 3. Get admin credentials from environment variables
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;

    // Validate that all required environment variables are provided
    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
      console.error('Error: Missing admin credentials in .env file.');
      console.error('Please ensure ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD are set.');
      process.exit(1); // Exit with failure
    }

    if (adminExists) {
      console.log('Admin user already exists. Updating credentials...');
      adminExists.name = ADMIN_NAME;
      adminExists.email = ADMIN_EMAIL;
      adminExists.phone = ADMIN_PHONE;
      adminExists.password = ADMIN_PASSWORD; 
      await adminExists.save(); // Utilizing the pre('save') hook to hash the new password
      console.log('Success: Admin credentials (including password) have been updated successfully!');
      process.exit(0); 
    }

    // 4. Create the admin user
    // The pre-save hook in user.model.js will automatically hash the password
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'approved', // Admin must be approved by default
    });

    console.log('Success: Admin user has been created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Execute the seed function
createAdmin();