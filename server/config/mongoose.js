import mongoose from "mongoose";

const connectToMongoDB = async (mongoURL, autoIndex = true) => {
  try {
    await mongoose.connect(mongoURL, {
      autoIndex,
    });

    console.log("Connected to MongoDB ✅");
    
  } catch (error) {
    console.error("MongoDB connection error:", error);
    
    // Retry connection after 5 seconds
    setTimeout(async () => {
      console.log("Retrying MongoDB connection...");

      try {
        await mongoose.connect(mongoURL, { autoIndex });
        console.log("MongoDB reconnected successfully ✅");

      } catch (err) {
        console.error("MongoDB retry failed:", err);
        process.exit(1); // Exit if retry fails
      }
    }, 5000);
  }
};

export default connectToMongoDB;
