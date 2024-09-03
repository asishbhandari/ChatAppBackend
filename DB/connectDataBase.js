const mongoose = require("mongoose");

// Connect to MongoDB

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB ", connect.connection.host);
  } catch (error) {
    console.log("failed to connect to MongoDB with error: " + error.message);
  }
};

module.exports = connectDB;
