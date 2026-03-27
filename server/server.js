require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db'); // Assuming db connection logic is inside src/db/index.js

const PORT = process.env.PORT || 3000;

// Function to initialize the database and start the server
const startServer = async () => {
  try {
    // 1. Connect to MongoDB first
    await connectDB();
    console.log('Database connected successfully');

    // 2. Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
     
    });
  } catch (error) {
    console.error('Failed to start the server:', error.message);
    process.exit(1); // Exit process with failure
  }
};

// Execute the startup function
startServer();