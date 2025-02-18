import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();



const connectDB = async () => {
    
  const dbURL = process.env.DATABASE_URL;
  console.log("hate",dbURL);
  

  if (!dbURL) {
    throw new Error('DATABASE_URL is not defined in the environment variables');
  }

  try {
    await mongoose.connect(dbURL); // No options are required in Mongoose v6+
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;



  