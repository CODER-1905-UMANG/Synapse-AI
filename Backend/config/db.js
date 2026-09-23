import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected with Database!");
  } catch (error) {
    console.error("Failed to connect with DB:", error.message);

    throw error;
  }
};

export default connectDB;