import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI;

const testSchema = new mongoose.Schema({
  title: String,
  mode: String,
  testType: String,
});

const Test = mongoose.model('Test', testSchema);

async function verify() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const tests = await Test.find({}).limit(5);
    console.log('Sample Tests:');
    tests.forEach(t => {
      console.log(`- Title: ${t.title}, mode: ${t.mode}, testType: ${t.testType}`);
    });

    // Verify if we can update a test to practice mode
    if (tests.length > 0) {
      const testToUpdate = tests[0];
      console.log(`Updating test "${testToUpdate.title}" to practice mode...`);
      await Test.findByIdAndUpdate(testToUpdate._id, { mode: 'practice' });
      
      const updated = await Test.findById(testToUpdate._id);
      console.log(`Updated test mode: ${updated.mode}`);
      
      // Revert back (optional, but good for cleanliness if user is just checking)
      // await Test.findByIdAndUpdate(testToUpdate._id, { mode: 'live' });
    }

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verify();
