import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const MONGO_URI = process.env.MONGO_URI;

const attemptSchema = new mongoose.Schema({
  student: mongoose.Schema.Types.ObjectId,
  test: mongoose.Schema.Types.ObjectId,
  attemptNumber: Number,
  score: Number,
});

const Attempt = mongoose.model('Attempt', attemptSchema);

async function verifyLeaderboard() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a test that has multiple attempts by different students
    const attemptsCount = await Attempt.countDocuments({});
    console.log(`Total attempts in DB: ${attemptsCount}`);

    // Test the logic: fetch ONLY attemptNumber 1
    const firstAttempts = await Attempt.find({ attemptNumber: 1 }).limit(5);
    console.log('Sample of First Attempts (Eligible for Leaderboard):');
    firstAttempts.forEach(a => {
      console.log(`- TestID: ${a.test}, Attempt#: ${a.attemptNumber}, Score: ${a.score}`);
    });

    const secondAttempts = await Attempt.find({ attemptNumber: { $gt: 1 } }).limit(5);
    console.log('Sample of Secondary Attempts (Should NOT be in Leaderboard):');
    secondAttempts.forEach(a => {
      console.log(`- TestID: ${a.test}, Attempt#: ${a.attemptNumber}, Score: ${a.score}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected');
  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  }
}

verifyLeaderboard();
